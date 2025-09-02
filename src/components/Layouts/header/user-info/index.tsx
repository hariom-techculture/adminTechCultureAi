"use client";

import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOutIcon, SettingsIcon } from "./icons";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types/user";

export function UserInfo() {
  const { signOut, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [localUser, setLocalUser] = useState<User | null>(user);
  
  useEffect(() => {
    if (user) {
      setLocalUser(user);
    }
  }, [user]);

  // helper: get first letter of name
  const getInitial = (name?: string) =>
    name ? name.charAt(0).toUpperCase() : "?";

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="rounded align-middle outline-none ring-primary ring-offset-2 focus-visible:ring-1 dark:ring-offset-gray-dark">
        <span className="sr-only">My Account</span>

        <figure className="flex items-center gap-3">
          {localUser?.profilePicture ? (
            <Image
              src={localUser.profilePicture}
              className="size-12 rounded-full object-cover"
              alt={`Avatar of ${localUser.name}`}
              role="presentation"
              width={48}
              height={48}
            />
          ) : (
            <div className="flex size-12 items-center justify-center rounded-full bg-gray-300 text-lg font-semibold text-white">
              {getInitial(localUser?.name)}
            </div>
          )}

          <figcaption className="flex items-center gap-1 font-medium text-dark dark:text-dark-6 max-[1024px]:sr-only">
            <span>{localUser?.name}</span>

            <ChevronUpIcon
              aria-hidden
              className={cn(
                "rotate-180 transition-transform",
                isOpen && "rotate-0",
              )}
              strokeWidth={1.5}
            />
          </figcaption>
        </figure>
      </DropdownTrigger>

      <DropdownContent
        className="border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark min-[230px]:min-w-[17.5rem]"
        align="end"
      >
        <h2 className="sr-only">User information</h2>

        <figure className="flex items-center gap-2.5 px-5 py-3.5">
          {localUser?.profilePicture ? (
            <Image
              src={localUser.profilePicture}
              className="size-12 rounded-full object-cover"
              alt={`Avatar for ${localUser.name}`}
              role="presentation"
              width={48}
              height={48}
            />
          ) : (
            <div className="flex size-12 items-center justify-center rounded-full bg-gray-300 text-lg font-semibold text-white">
              {getInitial(localUser?.name)}
            </div>
          )}

          <figcaption className="space-y-1 text-base font-medium">
            <div className="mb-2 leading-none text-dark dark:text-white">
              {localUser?.name}
            </div>
            <div className="leading-none text-gray-6">{localUser?.email}</div>
          </figcaption>
        </figure>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6 [&>*]:cursor-pointer">
          <Link
            href={"/pages/settings"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <SettingsIcon />
            <span className="mr-auto text-base font-medium">
              Account Settings
            </span>
          </Link>
        </div>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6">
          <button
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
            onClick={() => {
              setIsOpen(false);
              signOut();
            }}
          >
            <LogOutIcon />
            <span className="text-base font-medium">Log out</span>
          </button>
        </div>
      </DropdownContent>
    </Dropdown>
  );
}
