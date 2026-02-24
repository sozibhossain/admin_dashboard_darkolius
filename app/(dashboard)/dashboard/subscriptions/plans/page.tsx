"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  getApiErrorMessage,
  subscriptionApi,
  type SubscriptionPlan,
} from "@/lib/api";
import { cn } from "@/lib/utils";

type PlanTab = "initial" | "training";
type PlanDuration = "monthly" | "yearly" | "one-time";

type PlanFormState = {
  name: string;
  price: string;
  duration: PlanDuration;
  note: string;
  items: string[];
};

type DisplayPlan = {
  id: string;
  title: string;
  bullets: string[];
  priceValue?: string;
  priceSuffix?: string;
  source: "api" | "demo";
  apiPlan?: SubscriptionPlan;
};

type ThemeSet = {
  card: string;
  dot: string;
  button: string;
  priceAccent: string;
};

const emptyForm: PlanFormState = {
  name: "",
  price: "",
  duration: "monthly",
  note: "",
  items: [""],
};

const initialThemes: ThemeSet[] = [
  {
    card: "border-[#e5ab13] bg-[#f3f0e8]",
    dot: "bg-[#e5ab13]",
    button: "bg-[#edb513] text-white hover:bg-[#d8a410]",
    priceAccent: "text-[#e5ab13]",
  },
  {
    card: "border-[#a755f4] bg-[#d9c8e5]",
    dot: "bg-[#a755f4]",
    button: "bg-[#a755f4] text-white hover:bg-[#9446e3]",
    priceAccent: "text-[#a755f4]",
  },
  {
    card: "border-[#f09ab9] bg-[#f2dbe4]",
    dot: "bg-[#f09ab9]",
    button: "bg-[#f09ab9] text-white hover:bg-[#e585a8]",
    priceAccent: "text-[#f09ab9]",
  },
];

const trainingThemes: ThemeSet[] = [
  {
    card: "border-[#c281f3] bg-[#d6c3e5]",
    dot: "bg-[#a754f3]",
    button: "bg-[#be88e6] text-white hover:bg-[#ac76d6]",
    priceAccent: "text-[#a754f3]",
  },
  {
    card: "border-[#e5ab13] bg-[#eee3c7]",
    dot: "bg-[#e5ab13]",
    button: "bg-[#edb513] text-white hover:bg-[#d8a410]",
    priceAccent: "text-[#e5ab13]",
  },
  {
    card: "border-[#f09ab9] bg-[#f2dbe4]",
    dot: "bg-[#f09ab9]",
    button: "bg-[#f09ab9] text-white hover:bg-[#e585a8]",
    priceAccent: "text-[#f09ab9]",
  },
];

const demoInitialPlans: DisplayPlan[] = [
  {
    id: "initial-demo-1",
    title: "DAILY PASS",
    bullets: ["One-time", "Personalized workout plan", "No revisions", "No follow-ups"],
    priceValue: "€89",
    source: "demo",
  },
  {
    id: "initial-demo-2",
    title: "6-Month Plan",
    bullets: [
      "Gift: 1 Pro Factory T-shirt",
      "Full access to the gym",
      "Renewable subscription with a minimum commitment period of 6 months",
    ],
    priceValue: "€35",
    priceSuffix: "/ Month",
    source: "demo",
  },
  {
    id: "initial-demo-3",
    title: "12-Month Plan",
    bullets: [
      "Gift: 1 Pro Factory hoodie",
      "Full access to the gym",
      "Renewable subscription with a minimum commitment period of 12 months",
    ],
    priceValue: "€30",
    priceSuffix: "/ Month",
    source: "demo",
  },
];

const demoTrainingPlans: DisplayPlan[] = [
  {
    id: "training-demo-1",
    title: "Online Coaching",
    bullets: [
      "Monthly payment.",
      "Planning a training routine and weekly online reviews.",
      "Access starts after questionnaire and payment gateway.",
      "Includes nutrition + calendar follow-up.",
    ],
    source: "demo",
  },
  {
    id: "training-demo-2",
    title: "Personal Training",
    bullets: [
      "One-time payment product.",
      "1 to 1 personal training sessions.",
      "User selects package: 4, 8, or 12 sessions.",
      "Calendar booking with remaining credit counter.",
    ],
    source: "demo",
  },
];

const resolveDuration = (plan: SubscriptionPlan): PlanDuration => {
  if (plan.priceMonthly === plan.priceYearly) {
    return "one-time";
  }

  const yearlyFromMonthly = plan.priceMonthly * 12;
  if (Math.abs(yearlyFromMonthly - plan.priceYearly) <= 1) {
    return "monthly";
  }

  return "yearly";
};

const toPlanForm = (plan: SubscriptionPlan): PlanFormState => {
  const duration = resolveDuration(plan);
  const amount =
    duration === "monthly"
      ? plan.priceMonthly
      : duration === "yearly"
        ? plan.priceYearly
        : plan.priceMonthly;

  const [note, ...items] = plan.benefits ?? [];

  return {
    name: plan.name,
    price: String(amount),
    duration,
    note: note || "",
    items: items.length ? items : [""],
  };
};

type PlanModalProps = {
  open: boolean;
  pending: boolean;
  form: PlanFormState;
  isEditing: boolean;
  onClose: () => void;
  onChange: (updater: (prev: PlanFormState) => PlanFormState) => void;
  onSubmit: () => void;
};

function PlanModal({
  open,
  pending,
  form,
  isEditing,
  onClose,
  onChange,
  onSubmit,
}: PlanModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-5">
      <div className="w-full max-w-[760px] rounded-[8px] bg-[#efefef] p-5 shadow-2xl md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-2xl font-bold text-[#151515]">
            Add New Plan
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[#141414] transition-colors hover:text-black"
            aria-label="Close modal"
          >
            <X className="h-7 w-7" />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-base font-medium text-[#202020]">
              Plan Name
            </label>
            <input
              value={form.name}
              onChange={(event) =>
                onChange((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Starter"
              className="h-[58px] w-full rounded-[8px] border border-[#4474b9] bg-[#efefef] px-4 text-base text-[#202020] outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-base font-medium text-[#202020]">
              Plan Price
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-[#5b5b5b]">
                $
              </span>
              <input
                value={form.price}
                onChange={(event) =>
                  onChange((prev) => ({ ...prev, price: event.target.value }))
                }
                placeholder="500"
                inputMode="decimal"
                className="h-[58px] w-full rounded-[8px] border border-[#4474b9] bg-[#efefef] pl-8 pr-4 text-base text-[#202020] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-base font-medium text-[#202020]">
              Plan Duration
            </label>
            <select
              value={form.duration}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  duration: event.target.value as PlanDuration,
                }))
              }
              className="h-[58px] w-full rounded-[8px] border border-[#4474b9] bg-[#efefef] px-4 text-base text-[#202020] outline-none"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="one-time">One-time</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-base font-medium text-[#202020]">
              Plan Note
            </label>
            <input
              value={form.note}
              onChange={(event) =>
                onChange((prev) => ({ ...prev, note: event.target.value }))
              }
              placeholder="Add a short note"
              className="h-[58px] w-full rounded-[8px] border border-[#4474b9] bg-[#efefef] px-4 text-base text-[#202020] outline-none"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-base font-medium text-[#202020]">
            Plan Items
          </label>
          <div className="space-y-3">
            {form.items.map((item, index) => (
              <div key={`item-${index}`} className="flex items-center gap-2">
                <input
                  value={item}
                  onChange={(event) =>
                    onChange((prev) => {
                      const nextItems = [...prev.items];
                      nextItems[index] = event.target.value;
                      return { ...prev, items: nextItems };
                    })
                  }
                  placeholder="Up to 2 practice questions per certification"
                  className="h-[58px] w-full rounded-[8px] border border-[#4474b9] bg-[#efefef] px-4 text-base text-[#202020] outline-none"
                />
                {form.items.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      onChange((prev) => {
                        const nextItems = prev.items.filter((_, itemIndex) => itemIndex !== index);
                        return { ...prev, items: nextItems.length ? nextItems : [""] };
                      })
                    }
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#2a2a2a] text-[#2a2a2a]"
                    aria-label="Remove item"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() =>
                onChange((prev) => ({
                  ...prev,
                  items: [...prev.items, ""],
                }))
              }
              className="inline-flex h-[42px] items-center gap-2 rounded-full border border-[#1b1b1b] px-4 text-base text-[#1b1b1b]"
            >
              <Plus className="h-4 w-4" />
              Add More
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-[62px] items-center justify-center rounded-[10px] border border-[#e4a912] text-base font-medium text-[#e4a912] transition-colors hover:bg-[#f8efdc]"
          >
            Cancel Plan
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={pending}
            className="inline-flex h-[62px] items-center justify-center rounded-[10px] bg-[#edb513] text-base font-medium text-white transition-colors hover:bg-[#dba50f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Saving..." : isEditing ? "Update Plan" : "Save Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MembershipPlansPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<PlanTab>("initial");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [form, setForm] = useState<PlanFormState>(emptyForm);

  const subscriptionQuery = useQuery({
    queryKey: ["subscriptions", "plans", activeTab],
    queryFn: () => subscriptionApi.getSubscriptions(undefined, activeTab),
  });

  const createMutation = useMutation({
    mutationFn: subscriptionApi.create,
    onSuccess: () => {
      toast.success("Plan saved.");
      setIsModalOpen(false);
      setEditingPlan(null);
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<SubscriptionPlan> }) =>
      subscriptionApi.update(id, payload),
    onSuccess: () => {
      toast.success("Plan updated.");
      setIsModalOpen(false);
      setEditingPlan(null);
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const visiblePlans = useMemo(() => {
    const apiPlans = subscriptionQuery.data ?? [];

    if (apiPlans.length) {
      return apiPlans.map((plan) => ({
        id: plan._id,
        title: plan.name,
        bullets: plan.benefits.length ? plan.benefits : ["No plan details available."],
        priceValue: `€${plan.priceMonthly}`,
        priceSuffix: "/ Month",
        source: "api" as const,
        apiPlan: plan,
      }));
    }

    return activeTab === "initial" ? demoInitialPlans : demoTrainingPlans;
  }, [activeTab, subscriptionQuery.data]);
  const themeList = activeTab === "initial" ? initialThemes : trainingThemes;

  const openAddModal = () => {
    setEditingPlan(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (plan: DisplayPlan) => {
    if (plan.apiPlan) {
      setEditingPlan(plan.apiPlan);
      setForm(toPlanForm(plan.apiPlan));
      setIsModalOpen(true);
      return;
    }

    setEditingPlan(null);
    setForm({
      name: plan.title,
      price: plan.priceValue?.replace("€", "") || "",
      duration: "monthly",
      note: "",
      items: plan.bullets.length ? [...plan.bullets] : [""],
    });
    setIsModalOpen(true);
  };

  const savePlan = () => {
    const name = form.name.trim();
    const rawAmount = Number(form.price);
    const note = form.note.trim();
    const items = form.items.map((item) => item.trim()).filter(Boolean);

    if (!name) {
      toast.error("Plan name is required.");
      return;
    }

    if (Number.isNaN(rawAmount) || rawAmount <= 0) {
      toast.error("Plan price must be a valid number.");
      return;
    }

    const benefits = [note, ...items].filter(Boolean);

    if (!benefits.length) {
      toast.error("At least one plan item is required.");
      return;
    }

    let monthly = rawAmount;
    let yearly = rawAmount;

    if (form.duration === "monthly") {
      monthly = rawAmount;
      yearly = Math.round(rawAmount * 12 * 100) / 100;
    }

    if (form.duration === "yearly") {
      yearly = rawAmount;
      monthly = Math.round((rawAmount / 12) * 100) / 100;
    }

    const payload: Omit<SubscriptionPlan, "_id"> = {
      planType: editingPlan?.planType ?? activeTab,
      name,
      benefits,
      priceMonthly: monthly,
      priceYearly: yearly,
      isActive: true,
    };

    if (editingPlan?._id) {
      updateMutation.mutate({ id: editingPlan._id, payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold leading-[1.05] text-[#171717]">
            Memberships Dashboard
          </h2>
          <p className="mt-2 max-w-[950px] text-base text-[#464646]">
            View membership details, manage plans, and monitor usage seamlessly.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex h-[58px] shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[#efb411] px-7 text-base font-medium text-white transition-colors hover:bg-[#dcaa16]"
        >
          <Plus className="h-6 w-6" />
          Add New Plan
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-3">
        <button
          type="button"
          onClick={() => setActiveTab("initial")}
          className={cn(
            "inline-flex h-[58px] min-w-[170px] items-center justify-center rounded-[10px] border px-5 text-base font-medium transition-colors",
            activeTab === "initial"
              ? "border-[#efb411] bg-[#efb411] text-white"
              : "border-[#efb411] bg-transparent text-[#e5ab13] hover:bg-[#f8efdc]",
          )}
        >
          Initial Plan
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("training")}
          className={cn(
            "inline-flex h-[58px] min-w-[170px] items-center justify-center rounded-[10px] border px-5 text-base font-medium transition-colors",
            activeTab === "training"
              ? "border-[#efb411] bg-[#efb411] text-white"
              : "border-[#efb411] bg-transparent text-[#e5ab13] hover:bg-[#f8efdc]",
          )}
        >
          Training Plan
        </button>
      </div>

      {subscriptionQuery.isLoading ? (
        <div className="grid gap-6 pt-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="h-[325px] animate-pulse rounded-[18px] bg-[#dddddd]" />
          ))}
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-6 pt-4 md:grid-cols-2",
            activeTab === "initial" ? "xl:grid-cols-3" : "xl:max-w-[980px]",
          )}
        >
          {visiblePlans.map((plan, index) => {
            const theme = themeList[index % themeList.length];

            return (
              <article
                key={plan.id}
                className={cn("rounded-[18px] border px-5 pb-4 pt-4", theme.card)}
              >
                <h3 className="flex items-center gap-2 font-display text-2xl font-bold text-[#121212]">
                  <span className={cn("h-4 w-4 rounded-full", theme.dot)} />
                  {plan.title}
                </h3>

                <ul className="mt-3 space-y-1 text-sm text-[#1f1f1f]">
                  {plan.bullets.map((bullet, bulletIndex) => (
                    <li key={`${plan.id}-bullet-${bulletIndex}`}>
                      <span className="mr-2">•</span>
                      {bullet}
                    </li>
                  ))}
                </ul>

                {plan.priceValue ? (
                  <p className="mt-3 text-3xl font-bold leading-none text-[#151515]">
                    {plan.priceValue}
                    {plan.priceSuffix ? (
                      <span className={cn("ml-1 text-3xl", theme.priceAccent)}>
                        {plan.priceSuffix}
                      </span>
                    ) : null}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={() => openEditModal(plan)}
                  className={cn(
                    "mt-4 inline-flex h-[56px] min-w-[150px] items-center justify-center rounded-[10px] px-4 text-base font-medium",
                    theme.button,
                  )}
                >
                  Edit
                </button>
              </article>
            );
          })}
        </div>
      )}

      <PlanModal
        open={isModalOpen}
        pending={pending}
        form={form}
        isEditing={Boolean(editingPlan)}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlan(null);
          setForm(emptyForm);
        }}
        onChange={(updater) => setForm(updater)}
        onSubmit={savePlan}
      />
    </div>
  );
}


