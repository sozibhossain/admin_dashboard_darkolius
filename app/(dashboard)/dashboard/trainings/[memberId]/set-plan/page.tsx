"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminApi, nutrationApi, trainingApi } from "@/lib/api";
import { cn } from "@/lib/utils";

type PlanTab = "nutrition" | "training";
type MealType = "Breakfast" | "Lunch" | "Snacks" | "Dinner";

type TrainingDraft = {
  date: string;
  name: string;
  reps: string;
  rest: string;
  weight: string;
  imageFile: File | null;
  imageName: string;
};

type NutritionDraft = {
  date: string;
  meal: MealType;
  time: string;
  itemName: string;
  protein: string;
  carbs: string;
  fat: string;
  cal: string;
  imageFile: File | null;
  imageName: string;
};

type RepeatModalProps = {
  open: boolean;
  initialDate?: string;
  initialMeal: MealType;
  showMeal: boolean;
  onClose: () => void;
  onApply: (payload: { date: string; meal: MealType }) => void;
};

const MEALS: MealType[] = ["Breakfast", "Lunch", "Snacks", "Dinner"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const formatMonth = (year: number, month: number) =>
  new Date(year, month, 1).toLocaleDateString("en-US", { month: "long" });

function RepeatCalendarModal({
  open,
  initialDate,
  initialMeal,
  showMeal,
  onClose,
  onApply,
}: RepeatModalProps) {
  const initial = initialDate ? new Date(initialDate) : new Date();
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());
  const [day, setDay] = useState(initial.getDate());
  const [meal, setMeal] = useState<MealType>(initialMeal);

  if (!open) return null;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const padding = Array.from({ length: firstDay });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const apply = () => {
    const safeDate = new Date(year, month, day).toISOString().slice(0, 10);
    onApply({ date: safeDate, meal });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="flex w-full max-w-xl gap-4">
        {showMeal ? (
          <div className="self-end rounded-lg bg-white p-3">
            <p className="mb-2 text-xs text-zinc-500">Select Meal</p>
            <div className="space-y-1">
              {MEALS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMeal(item)}
                  className={cn(
                    "block w-28 rounded-md px-2 py-1.5 text-left text-sm",
                    meal === item
                      ? "bg-[#f8b400] text-white"
                      : "bg-zinc-100 text-zinc-700",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex-1 rounded-xl bg-white p-4 shadow-2xl">
          <button
            type="button"
            className="mb-3 h-8 w-full rounded-md bg-[#f8b400] text-sm font-semibold text-white"
          >
            Repeat
          </button>

          <div className="rounded-lg border border-zinc-200 p-3">
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (month === 0) {
                    setMonth(11);
                    setYear((prev) => prev - 1);
                  } else {
                    setMonth((prev) => prev - 1);
                  }
                }}
                className="rounded p-1 hover:bg-zinc-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2">
                <div className="rounded border border-zinc-200 px-2 py-1 text-sm">
                  {formatMonth(year, month)}
                </div>
                <div className="rounded border border-zinc-200 px-2 py-1 text-sm">{year}</div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (month === 11) {
                    setMonth(0);
                    setYear((prev) => prev + 1);
                  } else {
                    setMonth((prev) => prev + 1);
                  }
                }}
                className="rounded p-1 hover:bg-zinc-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {padding.map((_, idx) => (
                <div key={`pad-${idx}`} className="h-8" />
              ))}
              {days.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDay(item)}
                  className={cn(
                    "h-8 rounded text-sm",
                    day === item
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-700 hover:bg-zinc-100",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={apply}>Apply</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SetPlanPage() {
  const params = useParams<{ memberId: string }>();
  const memberId = String(params.memberId || "");

  const [tab, setTab] = useState<PlanTab>("training");

  const [trainingDraft, setTrainingDraft] = useState<TrainingDraft>({
    date: "",
    name: "",
    reps: "",
    rest: "",
    weight: "",
    imageFile: null,
    imageName: "",
  });
  const [nutritionDraft, setNutritionDraft] = useState<NutritionDraft>({
    date: "",
    meal: "Breakfast",
    time: "",
    itemName: "",
    protein: "",
    carbs: "",
    fat: "",
    cal: "",
    imageFile: null,
    imageName: "",
  });

  const [trainingQueue, setTrainingQueue] = useState<TrainingDraft[]>([]);
  const [nutritionQueue, setNutritionQueue] = useState<NutritionDraft[]>([]);

  const [repeatOpen, setRepeatOpen] = useState(false);
  const [repeatTarget, setRepeatTarget] = useState<PlanTab>("training");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const memberQuery = useQuery({
    queryKey: ["set-plan-member", memberId],
    queryFn: async () => {
      const result = await adminApi.getUsers({ page: 1, limit: 500 });
      return result.users.find((user) => String(user._id) === memberId) ?? null;
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const createTrainingRequest = (item: TrainingDraft) => {
        if (item.imageFile) {
          const payload = new FormData();
          payload.append("userId", memberId);
          payload.append("date", item.date);
          payload.append("name", item.name);
          if (item.reps) payload.append("reps", item.reps);
          if (item.rest) payload.append("rest", item.rest);
          if (item.weight) payload.append("weight", item.weight);
          payload.append("image", item.imageFile);
          return trainingApi.create(payload);
        }

        return trainingApi.create({
          userId: memberId,
          date: item.date,
          name: item.name,
          reps: item.reps,
          rest: item.rest,
          weight: item.weight,
        });
      };

      const createNutritionRequest = (item: NutritionDraft) => {
        if (item.imageFile) {
          const payload = new FormData();
          payload.append("userId", memberId);
          payload.append("date", item.date);
          payload.append("meal", item.meal);
          payload.append("time", item.time);
          payload.append("name", item.itemName);
          if (item.protein) payload.append("protein", item.protein);
          if (item.carbs) payload.append("carbs", item.carbs);
          if (item.fat) payload.append("fat", item.fat);
          if (item.cal) payload.append("cal", item.cal);
          payload.append("image", item.imageFile);
          return nutrationApi.create(payload);
        }

        return nutrationApi.create({
          userId: memberId,
          date: item.date,
          meal: item.meal,
          time: item.time,
          name: item.itemName,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          cal: item.cal,
        });
      };

      if (tab === "training") {
        const queue = [...trainingQueue];
        if (trainingDraft.name && trainingDraft.date) {
          queue.push(trainingDraft);
        }

        if (!queue.length) {
          throw new Error("Add at least one training plan before sending.");
        }

        await Promise.all(queue.map(createTrainingRequest));

        return;
      }

      const queue = [...nutritionQueue];
      if (nutritionDraft.itemName && nutritionDraft.date) {
        queue.push(nutritionDraft);
      }

      if (!queue.length) {
        throw new Error("Add at least one nutrition plan before sending.");
      }

      await Promise.all(queue.map(createNutritionRequest));
    },
    onSuccess: () => {
      toast.success("Plan sent successfully.");
      setTrainingQueue([]);
      setNutritionQueue([]);
      setTrainingDraft({
        date: "",
        name: "",
        reps: "",
        rest: "",
        weight: "",
        imageFile: null,
        imageName: "",
      });
      setNutritionDraft({
        date: "",
        meal: "Breakfast",
        time: "",
        itemName: "",
        protein: "",
        carbs: "",
        fat: "",
        cal: "",
        imageFile: null,
        imageName: "",
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to send plan.");
    },
  });

  const queueCount = tab === "training" ? trainingQueue.length : nutritionQueue.length;
  const memberName = memberQuery.data?.name || "Member";

  const openRepeat = (target: PlanTab) => {
    setRepeatTarget(target);
    setRepeatOpen(true);
  };

  const currentDate = repeatTarget === "training" ? trainingDraft.date : nutritionDraft.date;
  const currentMeal = repeatTarget === "training" ? "Breakfast" : nutritionDraft.meal;

  const applyRepeat = ({ date, meal }: { date: string; meal: MealType }) => {
    if (repeatTarget === "training") {
      setTrainingDraft((prev) => ({ ...prev, date }));
      return;
    }

    setNutritionDraft((prev) => ({ ...prev, date, meal }));
  };

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image size must be 10MB or less.");
      return;
    }

    if (tab === "training") {
      setTrainingDraft((prev) => ({ ...prev, imageFile: file, imageName: file.name }));
      return;
    }

    setNutritionDraft((prev) => ({ ...prev, imageFile: file, imageName: file.name }));
  };

  const clearImage = () => {
    if (tab === "training") {
      setTrainingDraft((prev) => ({ ...prev, imageFile: null, imageName: "" }));
      return;
    }

    setNutritionDraft((prev) => ({ ...prev, imageFile: null, imageName: "" }));
  };

  const activeImageName = tab === "training" ? trainingDraft.imageName : nutritionDraft.imageName;

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/dashboard/trainings/${memberId}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-700 hover:text-zinc-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Set Plan
          </Link>
          <p className="mt-1 text-base text-zinc-600">
            Send personalized diet and workout plans to your members from one place.
          </p>
          <p className="mt-1 text-sm text-zinc-500">For: {memberName}</p>
        </div>
        <Button disabled={sendMutation.isPending} onClick={() => sendMutation.mutate()}>
          {sendMutation.isPending ? "Sending..." : "Send"}
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTab("nutrition")}
              className={cn(
                "h-12 min-w-48 rounded-xl border text-2xl font-medium",
                tab === "nutrition"
                  ? "border-[#f8b400] bg-[#f8b400] text-white"
                  : "border-[#f8b400] bg-white text-[#f8b400]",
              )}
            >
              Nutrition
            </button>
            <button
              type="button"
              onClick={() => setTab("training")}
              className={cn(
                "h-12 min-w-48 rounded-xl border text-2xl font-medium",
                tab === "training"
                  ? "border-[#f8b400] bg-[#f8b400] text-white"
                  : "border-[#f8b400] bg-white text-[#f8b400]",
              )}
            >
              Training
            </button>
          </div>

          <div className="grid gap-3 xl:grid-cols-[220px_repeat(5,minmax(0,1fr))]">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white text-zinc-500"
            >
              <Upload className="mb-2 h-5 w-5 text-[#5c52bd]" />
              <span className="text-sm font-medium">Upload Image</span>
              <span className="text-xs">{activeImageName || "PNG,JPG,up to 10MB"}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handleImageSelect}
            />

            {tab === "training" ? (
              <>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Select Date</p>
                  <button
                    type="button"
                    onClick={() => openRepeat("training")}
                    className="flex h-11 w-full items-center justify-between rounded-xl border border-[#f8b400] px-3 text-sm text-[#d39900]"
                  >
                    {trainingDraft.date || "Select Date"}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Exercise Name</p>
                  <Input
                    value={trainingDraft.name}
                    onChange={(event) =>
                      setTrainingDraft((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Enter Name"
                    className="border-[#f8b400]"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Reps</p>
                  <Input
                    value={trainingDraft.reps}
                    onChange={(event) =>
                      setTrainingDraft((prev) => ({ ...prev, reps: event.target.value }))
                    }
                    placeholder="Enter Reps"
                    className="border-[#f8b400]"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Rest</p>
                  <Input
                    value={trainingDraft.rest}
                    onChange={(event) =>
                      setTrainingDraft((prev) => ({ ...prev, rest: event.target.value }))
                    }
                    placeholder="Enter Rest"
                    className="border-[#f8b400]"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Weight</p>
                  <Input
                    value={trainingDraft.weight}
                    onChange={(event) =>
                      setTrainingDraft((prev) => ({ ...prev, weight: event.target.value }))
                    }
                    placeholder="Weight"
                    className="border-[#f8b400]"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Select Date</p>
                  <button
                    type="button"
                    onClick={() => openRepeat("nutrition")}
                    className="flex h-11 w-full items-center justify-between rounded-xl border border-[#f8b400] px-3 text-sm text-[#d39900]"
                  >
                    {nutritionDraft.date || "Select Date"}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Select Meal</p>
                  <button
                    type="button"
                    onClick={() => openRepeat("nutrition")}
                    className="flex h-11 w-full items-center justify-between rounded-xl border border-[#f8b400] px-3 text-sm text-[#d39900]"
                  >
                    {nutritionDraft.meal}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Enter Time</p>
                  <Input
                    value={nutritionDraft.time}
                    onChange={(event) =>
                      setNutritionDraft((prev) => ({ ...prev, time: event.target.value }))
                    }
                    placeholder="Enter Time"
                    className="border-[#f8b400]"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Item Name and Weight</p>
                  <Input
                    value={nutritionDraft.itemName}
                    onChange={(event) =>
                      setNutritionDraft((prev) => ({ ...prev, itemName: event.target.value }))
                    }
                    placeholder="Enter Name Weight"
                    className="border-[#f8b400]"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 xl:col-span-2">
                  {[
                    { key: "protein", label: "Total Protein", placeholder: "eg:10gm" },
                    { key: "carbs", label: "Total Carbs", placeholder: "eg:10gm" },
                    { key: "fat", label: "Total Fat", placeholder: "eg:10gm" },
                    { key: "cal", label: "Total Cal", placeholder: "eg:10gm" },
                  ].map((item) => (
                    <div key={item.key} className="space-y-1">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <Input
                        value={nutritionDraft[item.key as keyof NutritionDraft] as string}
                        onChange={(event) =>
                          setNutritionDraft((prev) => ({
                            ...prev,
                            [item.key]: event.target.value,
                          }))
                        }
                        placeholder={item.placeholder}
                        className="border-[#f8b400]"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end">
            {activeImageName ? (
              <button
                type="button"
                onClick={clearImage}
                className="mr-2 rounded-md border border-zinc-300 px-3 text-xs text-zinc-700 hover:bg-zinc-100"
              >
                Remove Image
              </button>
            ) : null}
            <Button
              onClick={() => {
                if (tab === "training") {
                  if (!trainingDraft.date || !trainingDraft.name) {
                    toast.error("Date and exercise name are required.");
                    return;
                  }
                  setTrainingQueue((prev) => [...prev, trainingDraft]);
                  setTrainingDraft((prev) => ({
                    ...prev,
                    name: "",
                    reps: "",
                    rest: "",
                    weight: "",
                    imageFile: null,
                    imageName: "",
                  }));
                  toast.success("Training plan added to queue.");
                  return;
                }

                if (!nutritionDraft.date || !nutritionDraft.itemName) {
                  toast.error("Date and item name are required.");
                  return;
                }
                setNutritionQueue((prev) => [...prev, nutritionDraft]);
                setNutritionDraft((prev) => ({
                  ...prev,
                  time: "",
                  itemName: "",
                  protein: "",
                  carbs: "",
                  fat: "",
                  cal: "",
                  imageFile: null,
                  imageName: "",
                }));
                toast.success("Nutrition plan added to queue.");
              }}
            >
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            Queue: {queueCount} {tab === "training" ? "training" : "nutrition"} item(s) ready to send.
          </div>

          {tab === "training" && trainingQueue.length ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-zinc-800">Training Queue</p>
              <div className="space-y-2">
                {trainingQueue.map((item, index) => (
                  <div
                    key={`training-queued-${index}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700"
                  >
                    <p>
                      <span className="font-semibold">#{index + 1}</span> {item.date || "No date"} |{" "}
                      {item.name || "No name"} | Reps: {item.reps || "-"} | Rest: {item.rest || "-"} |
                      Weight: {item.weight || "-"} | Image: {item.imageName || "-"}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setTrainingQueue((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
                      }
                      className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === "nutrition" && nutritionQueue.length ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-zinc-800">Nutrition Queue</p>
              <div className="space-y-2">
                {nutritionQueue.map((item, index) => (
                  <div
                    key={`nutrition-queued-${index}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700"
                  >
                    <p>
                      <span className="font-semibold">#{index + 1}</span> {item.date || "No date"} |{" "}
                      {item.meal} | {item.time || "-"} | {item.itemName || "No item"} | P:{item.protein || "-"} C:
                      {item.carbs || "-"} F:{item.fat || "-"} Cal:{item.cal || "-"} | Image: {item.imageName || "-"}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setNutritionQueue((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
                      }
                      className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <RepeatCalendarModal
        open={repeatOpen}
        initialDate={currentDate}
        initialMeal={currentMeal}
        showMeal={repeatTarget === "nutrition"}
        onClose={() => setRepeatOpen(false)}
        onApply={applyRepeat}
      />
    </div>
  );
}
