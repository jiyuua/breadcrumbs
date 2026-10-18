require("dotenv").config();

const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("./prismaClient");

const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");

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


app.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);

});