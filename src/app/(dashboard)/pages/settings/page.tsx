"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { UserProfileForm } from "./_components/user-profile";
import { ChangePasswordForm } from "./_components/change-password";

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full space-y-6">
      <Breadcrumb pageName="Settings" />

      <ShowcaseSection title="Personal Information" className="!p-7">
        <UserProfileForm />
      </ShowcaseSection>

      <ShowcaseSection title="Change Password" className="!p-7">
        <ChangePasswordForm />
      </ShowcaseSection>
    </div>
  );

};