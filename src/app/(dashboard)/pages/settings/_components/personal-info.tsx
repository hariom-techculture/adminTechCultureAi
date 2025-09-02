"use client";
import {
  CallIcon,
  EmailIcon,
  PencilSquareIcon,
  UploadIcon,
  UserIcon,
} from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { User } from "@/types/user";
import Image from "next/image";

export function PersonalInfoForm() {
  const { user, setUser } = useAuth();
  const [userData, setUserData] = useState<User | null>(user);

  useEffect(() => {}, []);

  return (
    <ShowcaseSection title="Personal Information" className="!p-7">
      <form>
        <div className="mb-4 flex items-center gap-3">
          <Image
            src="/images/user/user-03.png"
            width={55}
            height={55}
            alt="User"
            className="size-14 rounded-full object-cover"
            quality={90}
          />
        </div>

        <InputGroup
          className="mb-5.5 w-full sm:w-1/2"
          type="text"
          name="fullName"
          label="Full Name"
          placeholder="David Jhon"
          value={userData?.name}
          icon={<UserIcon />}
          iconPosition="left"
          height="sm"
        />

        <InputGroup
          className="mb-5.5"
          type="email"
          name="email"
          label="Email Address"
          placeholder="devidjond45@gmail.com"
          defaultValue="devidjond45@gmail.com"
          icon={<EmailIcon />}
          iconPosition="left"
          height="sm"
        />

        <div className="relative mb-5.5 block w-full rounded-xl border border-dashed border-gray-4 bg-gray-2 hover:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary">
          <input
            type="file"
            name="profilePhoto"
            id="profilePhoto"
            accept="image/png, image/jpg, image/jpeg"
            hidden
          />

          <label
            htmlFor="profilePhoto"
            className="flex cursor-pointer flex-col items-center justify-center p-4 sm:py-7.5"
          >
            <div className="flex size-13.5 items-center justify-center rounded-full border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
              <UploadIcon />
            </div>

            <p className="mt-2.5 text-body-sm font-medium">
              <span className="text-primary">Click to upload</span> or drag and
              drop
            </p>

            <p className="mt-1 text-body-xs">
              SVG, PNG, JPG or GIF (max, 800 X 800px)
            </p>
          </label>
        </div>

        {/* <InputGroup
          className="mb-5.5"
          type="text"
          name="username"
          label="Username"
          placeholder="devidjhon24"
          defaultValue="devidjhon24"
          icon={<UserIcon />}
          iconPosition="left"
          height="sm"
        /> */}

        {/* <TextAreaGroup
          className="mb-5.5"
          label="BIO"
          placeholder="Write your bio here"
          icon={<PencilSquareIcon />}
          value="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam lacinia turpis tortor, consequat efficitur mi congue a. Curabitur cursus, ipsum ut lobortis sodales, enim arcu pellentesque lectus ac suscipit diam sem a felis. Cras sapien ex, blandit eu dui et suscipit gravida nunc. Sed sed est quis dui."
        /> */}

        <div className="flex justify-end gap-3">
          <button
            className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
            type="button"
          >
            Cancel
          </button>

          <button
            className="rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90"
            type="submit"
          >
            Save
          </button>
        </div>
      </form>
    </ShowcaseSection>
  );
}
