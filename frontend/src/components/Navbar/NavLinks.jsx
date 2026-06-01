import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const menuItems = [
  {
    key: "home",
    path: "/home",
  },
  {
    key: "analyze",
    path: "/analyze",
  },
  {
    key: "meals",
    path: "/meals",
  },
  {
    key: "track",
    path: "/track",
  },
  {
    key: "insights",
    path: "/insights",
  },
];

const NavLinks = ({ mobile = false, onNavigate }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    if (mobile && onNavigate) {
      onNavigate(path);
      return;
    }
    navigate(path);
  };

  return (
    <ul
      className={
        mobile
          ? "flex flex-col gap-2"
          : "hidden lg:flex items-center gap-8 text-sm font-medium"
      }
    >
      {menuItems.map((item) => (
        <li key={item.key}>
          <NavLink
            to={item.path}
            onClick={(e) => {
              if (mobile) {
                e.preventDefault();
                handleNavigation(item.path);
              }
            }}
            className={({ isActive }) =>
              mobile
                ? `flex items-center rounded-2xl px-4 py-4 font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#22C55E]/10 text-[#16A34A]"
                      : "text-gray-700 hover:bg-gray-50"
                  }`
                : isActive
                  ? "text-green-500 font-bold"
                  : "text-gray-500 hover:text-gray-900 transition-colors"
            }
          >
            {t(`nav.${item.key}`)}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

export default NavLinks;
