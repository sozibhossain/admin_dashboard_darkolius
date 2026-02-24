"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const CALENDAR_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const GREEN_DAYS = new Set([1, 2, 3, 4, 5]);
const RED_DAYS = new Set([6, 7]);

const MOCK_ATTENDANCE = [
  {
    date: "01 Feb, 2026",
    duration: "1hr 31 min",
    checkIn: "07:47 AM",
    checkOut: "09:18 AM",
  },
  {
    date: "02 Feb, 2026",
    duration: "2hr 15 min",
    checkIn: "08:00 AM",
    checkOut: "10:15 AM",
  },
  {
    date: "03 Feb, 2026",
    duration: "1hr 45 min",
    checkIn: "09:00 AM",
    checkOut: "10:45 AM",
  },
];

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => (
  <div className="space-y-1">
    <p className="text-xl font-semibold text-zinc-900">{label}</p>
    <div className="rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-600">
      {value?.trim() ? value : "N/A"}
    </div>
  </div>
);

export default function MemberDetailsPage() {
  const params = useParams<{ memberId: string }>();
  const memberId = String(params.memberId || "");

  const memberQuery = useQuery({
    queryKey: ["member-details", memberId],
    queryFn: async () => {
      const result = await adminApi.getUsers({ page: 1, limit: 500 });
      return result.users.find((user) => String(user._id) === memberId) ?? null;
    },
  });

  const member = memberQuery.data;
  const body = member?.personalBodyDetails ?? {};

  const calendarDays = useMemo(() => Array.from({ length: 30 }, (_, i) => i + 1), []);

  if (memberQuery.isLoading) {
    return <div className="p-3 text-sm text-zinc-500">Loading member details...</div>;
  }

  if (!member) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-zinc-600">
          Member not found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="space-y-1">
        <Link
          href="/dashboard/trainings"
          className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-700 hover:text-zinc-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Member&apos;s Details
        </Link>
        <p className="text-base text-zinc-600">
          Send personalized diet and workout plans to your members from one place.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-start justify-between gap-4 pt-5">
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={member.avatar?.url || "/logo-icon.png"}
              alt={member.name || "Member"}
              className="h-16 w-16 rounded-full border border-zinc-200 object-cover"
            />
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-semibold">Username:</span> {member.name || "-"}
              </p>
              <p>
                <span className="font-semibold">Member ID:</span> {member._id.slice(-7)}
              </p>
              <p>
                <span className="font-semibold">Contact Number:</span> {member.phone || "00000000000000000"}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {member.email || "-"}
              </p>
            </div>
          </div>

          <Link href={`/dashboard/trainings/${member._id}/set-plan`}>
            <Button>Send Training / Nutrition Plan</Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardContent className="space-y-3 pt-4">
            <p className="text-sm font-semibold text-[#f8b400]">Body Details :</p>
            <DetailItem label="Current Weight" value={body.currentWeight} />
            <DetailItem label="Current Height" value={body.currentHeight} />
            <DetailItem label="Target Weight" value={body.targetWeight} />
            <DetailItem label="Recent Weight Changes (if any)" value={body.recentWeightChanges} />
            <DetailItem label="Body Type" value={body.bodyType} />
            <DetailItem label="Sleep Patterns" value={body.sleepPatterns} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-4">
            <p className="text-sm font-semibold text-[#f8b400]">Nutrition Assesment :</p>
            <DetailItem label="Appetite & Hunger" value={body.appetiteHunger} />
            <DetailItem label="Typical Daily Meals" value={body.typicalDailyMeals} />
            <DetailItem label="Water & Fluid Intake" value={body.waterFluidIntake} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-4">
            <p className="text-sm font-semibold text-[#f8b400]">Other Information:</p>
            <DetailItem label="Surgical History (if any)" value={body.surgicalHistory} />
            <DetailItem label="Current Physical Pains (if any)" value={body.currentPhysicalPains} />
            <DetailItem label="Digestion & Gut Health" value={body.digestionGutHealth} />
            <DetailItem label="Supplements Currently Used" value={body.supplementsCurrentlyUsed} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl font-semibold text-zinc-900">Attendance Calendar</h2>
            <p className="text-base text-zinc-600">February 2026</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_260px]">
            <div>
              <div className="grid grid-cols-7 gap-2 text-center text-xs text-zinc-500">
                {CALENDAR_DAYS.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-2">
                {calendarDays.map((day) => (
                  <div
                    key={day}
                    className={cn(
                      "flex h-8 items-center justify-center rounded-md text-sm",
                      GREEN_DAYS.has(day) && "bg-green-200 text-green-900",
                      RED_DAYS.has(day) && "bg-red-200 text-red-900",
                      !GREEN_DAYS.has(day) && !RED_DAYS.has(day) && "bg-white text-zinc-800",
                    )}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 border-l border-zinc-200 pl-4">
              {MOCK_ATTENDANCE.map((item) => (
                <div key={item.date} className="space-y-1 border-l-2 border-green-500 pl-3">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>{item.date}</span>
                    <span>{item.duration}</span>
                  </div>
                  <p className="text-xs">
                    <span className="font-semibold text-blue-600">Check In:</span> {item.checkIn}
                  </p>
                  <p className="text-xs">
                    <span className="font-semibold text-orange-600">Check Out:</span> {item.checkOut}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
