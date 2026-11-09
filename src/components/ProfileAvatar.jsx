import { Link } from "react-router";
import "./ProfileAvatar.css";

const ProfileAvatar = ({ user }) => {
   // check for username and gets initial
   // initial placeholder for images in the future
   const name = user?.name?.trim() || user?.email || "User";
   const initials = name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

   return (
      // go to profile page when clicked
      <Link
         className="bc-profile-avatar"
         to="/profile"
         aria-label={`Go to ${name}'s profile`}
         title={`${name}'s profile`}>
         {initials}
      </Link>
   );
};

export default ProfileAvatar;
