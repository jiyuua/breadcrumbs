require("dotenv").config();

const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("./prismaClient");

const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");

const upload = require("./memoryUpload");

const {
    processMemoryPhoto,
    uploadMemoryPhoto,
    deleteMemoryPhoto
} = require("./memoryPhotoStorage");

const { supabase, storageBucket } = require("./supabaseStorage");


// PostgreSQL connection pool for storing sessions
const sessionPool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const app = express();
app.use(express.json())
// Configure user sessions
app.use(session({
    store: new PgSession({
        pool: sessionPool,
        tableName: "user_sessions",
        createTableIfMissing: true
    }),

    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24
    }
}));

const PORT = 3000;


app.get("/", (req, res) => {

    res.send("Breadcrumbs API is running");

});

app.post("/api/auth/register", async (req, res) => {
    try {
        // Get the submitted registration information
        const { name, email, password } = req.body || {};

        // Validate the required fields and types
        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password.trim()
        ) {
            return res.status(400).json({
                message: "Valid name, email, and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        // Normalize the email to avoid case-related duplicates
        const normalizedEmail = email.trim().toLowerCase();

        // Check whether the email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists"
            });
        }

        // Hash the password before storing it
        const passwordHash = await bcrypt.hash(password, 12);

        // Save the user in Supabase through Prisma
        const newUser = await prisma.user.create({
            data: {
                name: name.trim(),
                email: normalizedEmail,
                passwordHash
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
            }
        });

        // Return the new account information, excluding the password hash
        return res.status(201).json({
            message: "Account created successfully",
            user: newUser
        });

    } catch (error) {
        // Handle a duplicate email in case of simultaneous requests
        if (error.code === "P2002") {
            return res.status(409).json({
                message: "An account with this email already exists"
            });
        }

        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Unable to create account"
        });
    }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
    try {
        // 1. Get email and password from the request
        const { email, password } = req.body || {};

        // 2. Validate the information
        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // 3. Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // 4. Find the user in the database
        const user = await prisma.user.findUnique({
            where: {
                email: normalizedEmail
            }
        });

        // 5. Reject if user does not exist
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 6. Compare password with stored hash
        const passwordMatches = await bcrypt.compare(
            password,
            user.passwordHash
        );

        // 7. Reject incorrect password
        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 8. Return successful login response
        // Regenerate the session to prevent session fixation
req.session.regenerate((err) => {
    if (err) {
        console.error("Session error:", err);

        return res.status(500).json({
            message: "Unable to create login session"
        });
    }

    // Store the authenticated user's ID in the session
    req.session.userId = user.id;

    // Save the session to PostgreSQL
    req.session.save((err) => {
        if (err) {
            console.error("Session save error:", err);

            return res.status(500).json({
                message: "Unable to save login session"
            });
        }

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    });
});

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Unable to log in"
        });
    }
});

// Check the currently logged-in user
app.get("/api/auth/me", async (req, res) => {
    try {
        // 1. Check whether the session contains a user ID
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        // 2. Find the user in the database
        const user = await prisma.user.findUnique({
            where: {
                id: req.session.userId
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        });

        // 3. Check whether the user still exists
        if (!user) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        // 4. Return the logged-in user's information
        return res.status(200).json({
            message: "User is authenticated",
            user: user
        });

    } catch (error) {
        console.error("Authentication check error:", error);

        return res.status(500).json({
            message: "Unable to verify authentication"
        });
    }
});

// Log out the currently authenticated user
app.post("/api/auth/logout", (req, res) => {

    // Check whether the user has an active login session
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Not authenticated"
        });
    }

    // Destroy the session in PostgreSQL
    req.session.destroy((error) => {

        if (error) {
            console.error("Logout error:", error);

            return res.status(500).json({
                message: "Unable to log out"
            });
        }

        // Remove the session cookie from the browser
        res.clearCookie("connect.sid", {
            path: "/"
        });

        return res.status(200).json({
            message: "Logout successful"
        });
    });
});

// Search for other Breadcrumbs users
app.get("/api/users/search", async (req, res) => {
    try {
        // Require an authenticated user
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        const { q } = req.query;

        // Validate the search query
        if (
            typeof q !== "string" ||
            q.trim().length < 2 ||
            q.trim().length > 100
        ) {
            return res.status(400).json({
                message: "Search must contain 2 to 100 characters"
            });
        }

        // Search for users by name
        const users = await prisma.user.findMany({
            where: {
                id: {
                    not: req.session.userId
                },
                name: {
                    contains: q.trim(),
                    mode: "insensitive"
                }
            },
            select: {
                id: true,
                name: true
            },
            orderBy: [
                { name: "asc" },
                { id: "asc" }
            ],
            take: 20
        });

        res.set("Cache-Control", "no-store");

        return res.status(200).json({
            users
        });

    } catch (error) {
        console.error("User search error:", error);

        return res.status(500).json({
            message: "Unable to search for users"
        });
    }
});

// Send a friend request
app.post("/api/friends/requests", async (req, res) => {
    try {
        // Require authentication
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        const requesterId = req.session.userId;
        const { receiverId } = req.body || {};

        // Validate the receiver ID
        if (
            !Number.isSafeInteger(receiverId) ||
            receiverId <= 0 ||
            receiverId > 2147483647
        ) {
            return res.status(400).json({
                message: "Invalid receiver ID"
            });
        }

        // Prevent users from requesting themselves
        if (requesterId === receiverId) {
            return res.status(400).json({
                message: "You cannot send yourself a friend request"
            });
        }

        // Verify that the receiving user exists
        const receiver = await prisma.user.findUnique({
            where: {
                id: receiverId
            },
            select: {
                id: true
            }
        });

        if (!receiver) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Check for an existing friendship in either direction
        const existingFriendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { requesterId, receiverId },
                    {
                        requesterId: receiverId,
                        receiverId: requesterId
                    }
                ]
            }
        });

        if (existingFriendship) {
            return res.status(409).json({
                message: "A friendship or request already exists",
                status: existingFriendship.status
            });
        }

        // Create the friend request
        const friendship = await prisma.friendship.create({
            data: {
                requesterId,
                receiverId,
                status: "PENDING"
            }
        });

        return res.status(201).json({
            message: "Friend request sent successfully",
            friendship
        });

    } catch (error) {
        // Handle simultaneous duplicate requests
        if (error.code === "P2002") {
            return res.status(409).json({
                message: "A friendship or request already exists"
            });
        }

        console.error("Friend request error:", error);

        return res.status(500).json({
            message: "Unable to send friend request"
        });
    }
});
// Get incoming pending friend requests
app.get("/api/friends/requests/incoming", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        const requests = await prisma.friendship.findMany({
            where: {
                receiverId: req.session.userId,
                status: "PENDING"
            },
            select: {
                id: true,
                status: true,
                createdAt: true,
                requester: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return res.status(200).json({
            requests
        });

    } catch (error) {
        console.error("Incoming friend requests error:", error);

        return res.status(500).json({
            message: "Unable to retrieve incoming requests"
        });
    }
});
// Get outgoing pending friend requests
app.get("/api/friends/requests/outgoing", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        const requests = await prisma.friendship.findMany({
            where: {
                requesterId: req.session.userId,
                status: "PENDING"
            },
            select: {
                id: true,
                status: true,
                createdAt: true,
                receiver: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return res.status(200).json({
            requests
        });

    } catch (error) {
        console.error("Outgoing friend requests error:", error);

        return res.status(500).json({
            message: "Unable to retrieve outgoing requests"
        });
    }
});
// Accept a pending friend request
app.patch("/api/friends/requests/:requestId/accept", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        const requestId = Number(req.params.requestId);
        const userId = req.session.userId;

        // Validate the request ID
        if (
            !Number.isSafeInteger(requestId) ||
            requestId <= 0 ||
            requestId > 2147483647
        ) {
            return res.status(400).json({
                message: "Invalid request ID"
            });
        }

        // Only the receiver can accept a pending request
        const result = await prisma.friendship.updateMany({
            where: {
                id: requestId,
                receiverId: userId,
                status: "PENDING"
            },
            data: {
                status: "ACCEPTED"
            }
        });

        if (result.count === 0) {
            return res.status(404).json({
                message: "Pending friend request not found"
            });
        }

        return res.status(200).json({
            message: "Friend request accepted successfully",
            requestId,
            status: "ACCEPTED"
        });

    } catch (error) {
        console.error("Accept friend request error:", error);

        return res.status(500).json({
            message: "Unable to accept friend request"
        });
    }
});
// Decline a pending friend request
app.patch("/api/friends/requests/:requestId/decline", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        const requestId = Number(req.params.requestId);
        const userId = req.session.userId;

        // Validate the request ID
        if (
            !Number.isSafeInteger(requestId) ||
            requestId <= 0 ||
            requestId > 2147483647
        ) {
            return res.status(400).json({
                message: "Invalid request ID"
            });
        }

        // Only the receiver can decline a pending request
        const result = await prisma.friendship.updateMany({
            where: {
                id: requestId,
                receiverId: userId,
                status: "PENDING"
            },
            data: {
                status: "DECLINED"
            }
        });

        if (result.count === 0) {
            return res.status(404).json({
                message: "Pending friend request not found"
            });
        }

        return res.status(200).json({
            message: "Friend request declined successfully",
            requestId,
            status: "DECLINED"
        });

    } catch (error) {
        console.error("Decline friend request error:", error);

        return res.status(500).json({
            message: "Unable to decline friend request"
        });
    }
});
// Get all accepted friends of the logged-in user
app.get("/api/friends", async (req, res) => {
    try {
        // Require authentication
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        const userId = req.session.userId;

        // Find accepted friendships in either direction
        const friendships = await prisma.friendship.findMany({
            where: {
                status: "ACCEPTED",
                OR: [
                    { requesterId: userId },
                    { receiverId: userId }
                ]
            },
            select: {
                id: true,
                requesterId: true,
                updatedAt: true,
                requester: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                updatedAt: "desc"
            }
        });

        // Return the other user in each friendship
        const friends = friendships.map(friendship => {
            const friend = friendship.requesterId === userId
                ? friendship.receiver
                : friendship.requester;

            return {
                friendshipId: friendship.id,
                id: friend.id,
                name: friend.name,
                friendsSince: friendship.updatedAt
            };
        });

        res.set("Cache-Control", "no-store");

        return res.status(200).json({
            friends,
            totalFriends: friends.length
        });

    } catch (error) {
        console.error("Friends list error:", error);

        return res.status(500).json({
            message: "Unable to retrieve friends"
        });
    }
});
// Remove an accepted friendship
app.delete("/api/friends/:friendshipId", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        const friendshipId = Number(req.params.friendshipId);
        const userId = req.session.userId;

        if (
            !Number.isSafeInteger(friendshipId) ||
            friendshipId <= 0 ||
            friendshipId > 2147483647
        ) {
            return res.status(400).json({
                message: "Invalid friendship ID"
            });
        }

        // Either participant can remove the friendship
        const result = await prisma.friendship.deleteMany({
            where: {
                id: friendshipId,
                status: "ACCEPTED",
                OR: [
                    { requesterId: userId },
                    { receiverId: userId }
                ]
            }
        });

        if (result.count === 0) {
            return res.status(404).json({
                message: "Friendship not found"
            });
        }

        return res.status(200).json({
            message: "Friend removed successfully"
        });

    } catch (error) {
        console.error("Remove friend error:", error);

        return res.status(500).json({
            message: "Unable to remove friend"
        });
    }
});
// Cancel an outgoing pending friend request
app.delete("/api/friends/requests/:requestId", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        const requestId = Number(req.params.requestId);
        const userId = req.session.userId;

        if (
            !Number.isSafeInteger(requestId) ||
            requestId <= 0 ||
            requestId > 2147483647
        ) {
            return res.status(400).json({
                message: "Invalid request ID"
            });
        }

        // Only the sender can cancel a pending request
        const result = await prisma.friendship.deleteMany({
            where: {
                id: requestId,
                requesterId: userId,
                status: "PENDING"
            }
        });

        if (result.count === 0) {
            return res.status(404).json({
                message: "Pending outgoing request not found"
            });
        }

        return res.status(200).json({
            message: "Friend request canceled successfully"
        });

    } catch (error) {
        console.error("Cancel friend request error:", error);

        return res.status(500).json({
            message: "Unable to cancel friend request"
        });
    }
});

app.get("/api/preferences", async (req, res) => {
  try {
    // Check whether the user is logged in
    if (!req.session.userId) {
      return res.status(401).json({
        error: "Not authenticated"
      });
    }

    // Find preferences belonging to the logged-in user
    const preferences = await prisma.userPreference.findUnique({
      where: {
        userId: req.session.userId
      }
    });

    // Return the user's preferences
    res.status(200).json({
      preferences: preferences
    });

  } catch (error) {
    console.error("Error retrieving preferences:", error);

    res.status(500).json({
      error: "Failed to retrieve preferences"
    });
  }
});


app.put("/api/preferences", async (req, res) => {
  try {
    // Make sure the user is logged in
    if (!req.session.userId) {
      return res.status(401).json({
        error: "Not authenticated"
      });
    }

    // Get the preferences sent by the frontend
    const {
      budget,
      interests,
      boroughs,
      transportation,
      availableHours,
      maxTravelMinutes
    } = req.body ?? {};

    // Validate the submitted values
    const validBoroughs = [
      "Manhattan", "Brooklyn", "Queens",
      "Bronx", "Staten Island"
    ];

    const validTransportation = [
      "Walking", "Subway", "Bus", "Biking", "Driving"
    ];

    const validInteger = (value) =>
      value === null ||
      (Number.isSafeInteger(value) && value >= 0);

    if (
      !validInteger(budget) ||
      !validInteger(availableHours) ||
      !validInteger(maxTravelMinutes) ||
      !Array.isArray(interests) ||
      !interests.every(item =>
        typeof item === "string" &&
        item.trim().length > 0 &&
        item.length <= 100
      ) ||
      interests.length > 20 ||
      !Array.isArray(boroughs) ||
      !boroughs.every(item => validBoroughs.includes(item)) ||
      boroughs.length > 5 ||
      !(transportation === null ||
        validTransportation.includes(transportation))
    ) {
      return res.status(400).json({
        error: "Invalid preferences"
      });
    }

    // Create preferences if missing, otherwise update them
    const preferences = await prisma.userPreference.upsert({
      where: {
        userId: req.session.userId
      },
      update: {
        budget,
        interests,
        boroughs,
        transportation,
        availableHours,
        maxTravelMinutes
      },
      create: {
        userId: req.session.userId,
        budget,
        interests,
        boroughs,
        transportation,
        availableHours,
        maxTravelMinutes
      }
    });

    res.status(200).json({ preferences });

  } catch (error) {
    console.error("Error saving preferences:", error);

    res.status(500).json({
      error: "Failed to save preferences"
    });
  }
});


 // Create a new memory for the logged-in user
app.post("/api/memories", async (req, res) => {
    try {
        // Check whether the user is authenticated
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        // Get the memory information
        const {
            title,
            description,
            location,
            latitude,
            longitude,
            visibility = "PRIVATE"
        } = req.body || {};

        if (!["PRIVATE", "FRIENDS"].includes(visibility)) {
    return res.status(400).json({
        message: "Visibility must be PRIVATE or FRIENDS"
    });
}

        // Validate required text fields
        if (
            typeof title !== "string" ||
            !title.trim() ||
            title.trim().length > 100 ||
            typeof location !== "string" ||
            !location.trim() ||
            location.trim().length > 200 ||
            (description !== undefined &&
                description !== null &&
                (typeof description !== "string" ||
                 description.length > 1000))
        ) {
            return res.status(400).json({
                message: "Invalid memory information"
            });
        }

        // Validate optional coordinates
        const validCoordinate = (value, min, max) =>
            value === undefined ||
            value === null ||
            (typeof value === "number" &&
             Number.isFinite(value) &&
             value >= min &&
             value <= max);

        if (
            !validCoordinate(latitude, -90, 90) ||
            !validCoordinate(longitude, -180, 180)
        ) {
            return res.status(400).json({
                message: "Invalid coordinates"
            });
        }

        // Create the memory in Supabase PostgreSQL
        const memory = await prisma.memory.create({
            data: {
                userId: req.session.userId,
                title: title.trim(),
                description: description?.trim() || null,
                location: location.trim(),
                latitude: latitude ?? null,
                longitude: longitude ?? null,
                visibility: visibility 
            }
        });

        // Return the created memory
        return res.status(201).json({
            message: "Memory created successfully",
            memory
        });

    } catch (error) {
        console.error("Memory creation error:", error);

        return res.status(500).json({
            message: "Unable to create memory"
        });
    }
});


 // Get all memories belonging to the logged-in user
app.get("/api/memories", async (req, res) => {
    try {
        // Check whether the user is logged in
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        // Retrieve only this user's memories
        const memories = await prisma.memory.findMany({
            where: {
                userId: req.session.userId
            },
            include: {
                photos: {
                    select: {
                        id: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return res.status(200).json({
            memories
        });

    } catch (error) {
        console.error("Error retrieving memories:", error);

        return res.status(500).json({
            message: "Unable to retrieve memories"
        });
    }
});
// Update the visibility of an existing memory
app.patch("/api/memories/:memoryId/visibility", async (req, res) => {
    try {
        // Require authentication
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        const userId = req.session.userId;
        const memoryId = Number(req.params.memoryId);
        const { visibility } = req.body || {};

        // Validate memory ID
        if (
            !Number.isSafeInteger(memoryId) ||
            memoryId <= 0 ||
            memoryId > 2147483647
        ) {
            return res.status(400).json({
                message: "Invalid memory ID"
            });
        }

        // Validate visibility
        if (!["PRIVATE", "FRIENDS"].includes(visibility)) {
            return res.status(400).json({
                message: "Visibility must be PRIVATE or FRIENDS"
            });
        }

        // Only the memory owner can update visibility
        const result = await prisma.memory.updateMany({
            where: {
                id: memoryId,
                userId
            },
            data: {
                visibility
            }
        });

        if (result.count === 0) {
            return res.status(404).json({
                message: "Memory not found"
            });
        }

        return res.status(200).json({
            message: "Memory visibility updated successfully",
            memoryId,
            visibility
        });

    } catch (error) {
        console.error("Update memory visibility error:", error);

        return res.status(500).json({
            message: "Unable to update memory visibility"
        });
    }
});


app.post("/api/memories/:memoryId/photos", (req, res) => {
    // Authenticate before processing any uploaded files
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Not authenticated"
        });
    }

    upload.array("photos", 6)(req, res, async (uploadError) => {
        
if (uploadError) {
    // File exceeds the 10 MB upload limit
    if (uploadError.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
            message: "Photo must be 10 MB or smaller"
        });
    }

    // More than 6 photos or an unexpected file field
    if (
        uploadError.code === "LIMIT_FILE_COUNT" ||
        uploadError.code === "LIMIT_UNEXPECTED_FILE"
    ) {
        return res.status(400).json({
            message: "Maximum 6 photos per upload"
        });
    }

    // Unsupported file types or other upload errors
    return res.status(400).json({
        message: uploadError.message || "Invalid photo upload"
    });
}


        const memoryId = Number(req.params.memoryId);
        const userId = req.session.userId;
        const files = req.files || [];

        if (!Number.isSafeInteger(memoryId) || memoryId <= 0) {
            return res.status(400).json({
                message: "Invalid memory ID"
            });
        }

        if (files.length === 0) {
            return res.status(400).json({
                message: "At least one photo is required"
            });
        }

        // Track files uploaded during this request for cleanup
        const uploadedPaths = [];

        try {
            // Process images before accessing Storage
            const processedPhotos = await Promise.all(
                files.map(processMemoryPhoto)
            );

            // Serialize uploads for this user using a database lock
            const photos = await prisma.$transaction(async (tx) => {
                await tx.$queryRaw`
                    SELECT id FROM "User"
                    WHERE id = ${userId}
                    FOR UPDATE
                `;

                // Verify ownership
                const memory = await tx.memory.findFirst({
                    where: {
                        id: memoryId,
                        userId
                    }
                });

                if (!memory) {
                    const error = new Error("Memory not found");
                    error.status = 404;
                    throw error;
                }

                const [memoryCount, userCount] = await Promise.all([
                    tx.memoryPhoto.count({
                        where: { memoryId }
                    }),
                    tx.memoryPhoto.count({
                        where: {
                            memory: { userId }
                        }
                    })
                ]);

                if (
                    memoryCount + files.length > 6 ||
                    userCount + files.length > 30
                ) {
                    const error = new Error(
                        "Photo limit exceeded (6 per memory, 30 per user)"
                    );
                    error.status = 409;
                    throw error;
                }

                const savedPhotos = [];

                for (const buffer of processedPhotos) {
                    const storagePath = await uploadMemoryPhoto(
                        userId,
                        memoryId,
                        buffer
                    );

                    uploadedPaths.push(storagePath);

                    const photo = await tx.memoryPhoto.create({
                        data: {
                            memoryId,
                            storagePath
                        },
                        select: {
                            id: true,
                            createdAt: true
                        }
                    });

                    savedPhotos.push(photo);
                }

                return savedPhotos;
            }, {
                maxWait: 10000,
                timeout: 60000
            });

            return res.status(201).json({
                message: "Photos uploaded successfully",
                photos
            });

        } catch (error) {
            // Remove uploaded files if the transaction failed
            for (const path of uploadedPaths) {
                try {
                    await deleteMemoryPhoto(path);
                } catch (cleanupError) {
                    console.error(
                        "Photo cleanup failed:",
                        cleanupError
                    );
                }
            }

            console.error("Memory photo upload error:", error);

            return res.status(error.status || 500).json({
                message: error.status
                    ? error.message
                    : "Unable to upload photos"
            });
        }
    });
});


 // Generate a temporary URL for a private memory photo
app.get("/api/memories/:memoryId/photos/:photoId/url", async (req, res) => {
    try {
        // Check whether the user is logged in
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        const memoryId = Number(req.params.memoryId);
        const photoId = Number(req.params.photoId);

        // Validate both IDs
        if (
            !Number.isSafeInteger(memoryId) ||
            memoryId <= 0 ||
            !Number.isSafeInteger(photoId) ||
            photoId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid memory or photo ID"
            });
        }

        // Find the photo and verify that the user owns its memory
        const photo = await prisma.memoryPhoto.findFirst({
            where: {
                id: photoId,
                memoryId,
                memory: {
                    userId: req.session.userId
                }
            },
            select: {
                storagePath: true
            }
        });

        if (!photo) {
            return res.status(404).json({
                message: "Photo not found"
            });
        }

        // Generate a signed URL valid for 5 minutes
        const { data, error } = await supabase.storage
            .from(storageBucket)
            .createSignedUrl(photo.storagePath, 300);

        if (error || !data?.signedUrl) {
            console.error("Signed URL error:", error);

            return res.status(500).json({
                message: "Unable to generate photo URL"
            });
        }

        // Prevent caching the response containing the signed URL
        res.set("Cache-Control", "no-store");

        return res.status(200).json({
            photoId,
            url: data.signedUrl,
            expiresIn: 300
        });

    } catch (error) {
        console.error("Photo URL error:", error);

        return res.status(500).json({
            message: "Unable to retrieve photo URL"
        });
    }
});

app.delete("/api/memories/:memoryId/photos/:photoId", async (req, res) => {
    try {
        // Require an authenticated user
        if (!req.session?.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        const userId = req.session.userId;
        const memoryId = Number(req.params.memoryId);
        const photoId = Number(req.params.photoId);

        // Validate the requested IDs
        if (
            !Number.isSafeInteger(memoryId) ||
            memoryId <= 0 ||
            !Number.isSafeInteger(photoId) ||
            photoId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid memory or photo ID"
            });
        }

        // Only find photos owned by the logged-in user
        const photo = await prisma.memoryPhoto.findFirst({
            where: {
                id: photoId,
                memoryId,
                memory: {
                    userId
                }
            },
            select: {
                id: true,
                storagePath: true
            }
        });

        if (!photo) {
            return res.status(404).json({
                message: "Photo not found"
            });
        }

        // Remove the photo from private Supabase Storage
        await deleteMemoryPhoto(photo.storagePath);

        // Remove its database record, scoped to the same photo
        const result = await prisma.memoryPhoto.deleteMany({
            where: {
                id: photoId,
                memoryId,
                memory: {
                    userId
                }
            }
        });

        if (result.count === 0) {
            console.error("Photo file removed but database record was not deleted", {
                photoId,
                memoryId
            });

            return res.status(500).json({
                message: "Photo file removed, but database cleanup failed"
            });
        }

        return res.status(200).json({
            message: "Photo deleted successfully",
            photoId
        });

    } catch (error) {
        console.error("Delete photo error:", error);

        return res.status(500).json({
            message: "Unable to delete photo"
        });
    }
});


app.delete("/api/memories/:memoryId", async (req, res) => {
    try {
        if (!req.session?.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        const memoryId = Number(req.params.memoryId);
        const userId = req.session.userId;

        if (!Number.isSafeInteger(memoryId) || memoryId <= 0) {
            return res.status(400).json({
                message: "Invalid memory ID"
            });
        }

        // Verify ownership and retrieve associated photos
        const memory = await prisma.memory.findFirst({
            where: {
                id: memoryId,
                userId
            },
            include: {
                photos: {
                    select: {
                        id: true,
                        storagePath: true
                    }
                }
            }
        });

        if (!memory) {
            return res.status(404).json({
                message: "Memory not found"
            });
        }

        // Delete all associated photos from private Storage
        for (const photo of memory.photos) {
            await deleteMemoryPhoto(photo.storagePath);
        }

        // Delete photo records and memory in one database transaction
        await prisma.$transaction(async (tx) => {
            await tx.memoryPhoto.deleteMany({
                where: {
                    memoryId,
                    memory: {
                        userId
                    }
                }
            });

            const deleted = await tx.memory.deleteMany({
                where: {
                    id: memoryId,
                    userId
                }
            });

            if (deleted.count !== 1) {
                throw new Error("Memory was not deleted");
            }
        });

        return res.status(200).json({
            message: "Memory deleted successfully",
            memoryId,
            photosDeleted: memory.photos.length
        });

    } catch (error) {
        console.error("Delete memory error:", error);

        return res.status(500).json({
            message: "Unable to delete memory"
        });
    }
});



app.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);

});