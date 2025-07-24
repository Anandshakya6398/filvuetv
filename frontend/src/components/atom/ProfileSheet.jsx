"use client";
import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import Image from "next/image";
import { ChevronRightIcon, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { navLinks } from "../section/Header";
import { useSelector, useDispatch } from "react-redux";
import { userLoggedOutDetails } from "@/redux/userSlice";
import { api, ENDPOINT } from "@/lib/api";
import { useRouter } from "next/navigation";

const DEFAULT_IMAGE = "/profile.avif";

const ProfileSheet = () => {
  const [open, setOpen] = useState(false);
  const [profilePic, setProfilePic] = useState(DEFAULT_IMAGE);
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  // Reset to default image on logout
  useEffect(() => {
    if (!userData.isLoggedIn) {
      setProfilePic(DEFAULT_IMAGE);
    }
  }, [userData.isLoggedIn]);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file && userData.isLoggedIn) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfilePic(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await api.get(ENDPOINT.logout);
      if (res.data.status === "success") {
        dispatch(userLoggedOutDetails());
        setProfilePic(DEFAULT_IMAGE); // reset image on logout
        router.push("/");
      }
    } catch (err) {
      console.log("err: ", err);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <Image
          src={profilePic}
          alt="Profile Icon"
          className="ml-4 h-10 w-10 rounded-full object-cover"
          width={40}
          height={40}
        />
      </SheetTrigger>
      <SheetContent side={"right"} className="px-6">
        <div className="bg-slate-700/30 p-6 flex flex-col items-center gap-2 sm:mt-[10px] rounded-lg">
          {userData.isLoggedIn ? (
            <label htmlFor="profile-upload" className="cursor-pointer">
              <Image
                src={profilePic}
                alt="Profile Icon"
                className="h-[80px] w-[80px] rounded-full sm:-mt-[40px] object-cover"
                width={80}
                height={80}
              />
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePicChange}
              />
              <span className="block text-xs text-center mt-2 text-pink-600">
                Change Profile Pic
              </span>
            </label>
          ) : (
            <div>
              <Image
                src={profilePic}
                alt="Guest Icon"
                className="h-[80px] w-[80px] rounded-full sm:-mt-[40px] object-cover opacity-60"
                width={80}
                height={80}
              />
              <span className=" hidden text-xs text-center mt-1 text-gray-400">
                Login to change profile pic
              </span>
            </div>
          )}
          <p className="text-xl font-bold capitalize">
            {userData.isLoggedIn ? userData.user.name : "Guest"}
          </p>
          <Link
            href={userData.isLoggedIn ? "/" : "/login"}
            className="rounded-full font-medium mt-1 text-base px-4 py-2 bg-pink-600"
            onClick={() => {
              setOpen(false);
              if (userData.isLoggedIn) handleLogout();
            }}
          >
            {userData.isLoggedIn ? "Logout" : "Login"}
          </Link>
        </div>

        <div className="divide-y my-2">
          <Link
            href="/subscription"
            className="flex items-center justify-between px-2 py-2 text-sm"
            onClick={() => setOpen(false)}
          >
            Subscribe Now
            <ChevronRightIcon className="w-6 h-6" />
          </Link>

          <div>
            {navLinks.map((link) => (
              <Link
                href={link.href}
                key={link.key}
                className="flex items-center justify-between px-2 py-4 text-sm"
                onClick={() => setOpen(false)}
              >
                {link.name}
                <ExternalLinkIcon className="w-4 h-4" />
              </Link>
            ))}
          </div>

          <Link
            href="/"
            className="flex items-center justify-between px-2 py-4 text-sm"
          >
            Help and Legal
            <ChevronRightIcon className="w-6 h-6" />
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileSheet;
