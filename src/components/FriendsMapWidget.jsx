
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "./FriendsMapWidget.css";

// Sample locations for the Breadcrumbs capstone.
// These are NOT real-time friend locations.
const friends = [
  {
    name: "Raissa",
    area: "Central Park",
    position: [40.7829, -73.9654],
    color: "#B88B6E",
    initial: "R",
  },
  {
    name: "Jin",
    area: "Times Square",
    position: [40.7580, -73.9855],
    color: "#86B0B2",
    initial: "J",
  },
  {
    name: "Katherin",
    area: "SoHo",
    position: [40.7233, -73.9980],
    color: "#BD93AA",
    initial: "K",
  },
  {
    name: "Omar",
    area: "DUMBO",
    position: [40.7033, -73.9881],
    color: "#9A9B7F",
    initial: "O",
  },
];

// Moves the map toward the selected friend.
function FollowFriend({ friend }) {
  const map = useMap();

  useEffect(() => {
    if (friend) {
      map.flyTo(friend.position, 15, {
        duration: 1.2,
      });
    } else {
      // Return to the NYC overview.
      map.flyTo([40.7484, -73.9857], 12, {
        duration: 1.2,
      });
    }
  }, [friend, map]);

  return null;
}

export default function FriendsMapWidget() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="bfm-widget">
      {/* INTERACTIVE NYC MAP */}
      <div className="bfm-map">
        <MapContainer
          center={[40.7484, -73.9857]}
          zoom={12}
          minZoom={10}
          maxZoom={18}
          scrollWheelZoom={false}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {friends.map((friend) => (
            <CircleMarker
              key={friend.name}
              center={friend.position}
              radius={
                selected?.name === friend.name
                  ? 16
                  : 12
              }
              pathOptions={{
                color: "#FFFFFF",
                weight: 3,
                fillColor: friend.color,
                fillOpacity: 1,
              }}
              eventHandlers={{
                click: () => setSelected(friend),
              }}
            >
              <Popup>
                <div className="bfm-popup">
                  <strong>{friend.name}</strong>
                  <p>Exploring near {friend.area}</p>
                  <small>Demo location</small>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          <FollowFriend friend={selected} />
        </MapContainer>
      </div>

      {/* FRIEND LIST */}
      <div className="bfm-friends">
        <div className="bfm-friends-heading">
          <h3>Your NYC Crew ✦</h3>
          <p>
            Select a friend to find them on the map.
          </p>
        </div>

        {friends.map((friend) => (
          <button
            type="button"
            key={friend.name}
            className={
              selected?.name === friend.name
                ? "bfm-friend selected"
                : "bfm-friend"
            }
            onClick={() => setSelected(friend)}
          >
            <span
              className="bfm-avatar"
              style={{
                background: friend.color,
              }}
            >
              {friend.initial}
            </span>

            <span className="bfm-friend-info">
              <strong>{friend.name}</strong>
              <small>⌖ Near {friend.area}</small>
            </span>

            <span className="bfm-arrow">↗</span>
          </button>
        ))}

        <button
          type="button"
          className="bfm-show-all"
          onClick={() => setSelected(null)}
        >
          Show all friends
        </button>

        <p className="bfm-disclaimer">
          ✦ These are sample NYC locations for the
          Breadcrumbs capstone preview. Live location
          sharing is not enabled.
        </p>
      </div>
    </div>
  );
}
