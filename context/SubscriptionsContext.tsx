import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { HOME_SUBSCRIPTIONS, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { calculateNextRenewalDate } from "@/lib/utils";
import dayjs from "dayjs";

interface SubscriptionsContextType {
  subscriptions: Subscription[];
  upcomingSubscriptions: UpcomingSubscription[];
  currentMonthlySpend: number;
  projectedFutureSpend: number;
  totalMonthlySpend: number;
  activeCount: number;
  addSubscription: (subscription: Subscription) => void;
  toggleAutoRenew: (id: string) => void;
  reactivateSubscription: (
    id: string,
    newStartDate: string,
    newRenewalDate: string,
  ) => void;
  deleteSubscription: (id: string) => void;
}

const normalizeSubscriptionDates = (subs: Subscription[]): Subscription[] => {
  const now = dayjs();
  return subs.map((sub) => {
    // 1. If cancelling and renewalDate has passed -> subscription is now cancelled/expired
    if (
      sub.status === "cancelling" &&
      sub.renewalDate &&
      dayjs(sub.renewalDate).isBefore(now, "day")
    ) {
      return { ...sub, status: "cancelled" };
    }

    // 2. If active and renewalDate has passed -> auto-renew occurred, advance renewal date
    if (
      sub.status === "active" &&
      sub.renewalDate &&
      dayjs(sub.renewalDate).isBefore(now, "day")
    ) {
      const nextDate = calculateNextRenewalDate(
        sub.renewalDate,
        (sub.billing as "Monthly" | "Yearly") || "Monthly",
      );
      return { ...sub, renewalDate: nextDate };
    }

    return sub;
  });
};

const SubscriptionsContext = createContext<SubscriptionsContextType | undefined>(undefined);

export const SubscriptionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() =>
    normalizeSubscriptionDates(HOME_SUBSCRIPTIONS),
  );
  const [upcomingSubscriptions] = useState<UpcomingSubscription[]>(UPCOMING_SUBSCRIPTIONS);

  const addSubscription = useCallback((newSub: Subscription) => {
    setSubscriptions((prev) => [newSub, ...prev]);
  }, []);

  const toggleAutoRenew = useCallback((id: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id !== id) return sub;
        // If active -> set to cancelling (remains active until renewalDate, then stops)
        if (sub.status === "active") {
          return { ...sub, status: "cancelling" };
        }
        // If cancelling -> resume auto-renew
        if (sub.status === "cancelling") {
          return { ...sub, status: "active" };
        }
        return sub;
      }),
    );
  }, []);

  const reactivateSubscription = useCallback(
    (id: string, newStartDate: string, newRenewalDate: string) => {
      setSubscriptions((prev) =>
        prev.map((sub) => {
          if (sub.id !== id) return sub;
          return {
            ...sub,
            startDate: newStartDate,
            renewalDate: newRenewalDate,
            status: "active",
          };
        }),
      );
    },
    [],
  );

  const deleteSubscription = useCallback((id: string) => {
    setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
  }, []);

  // Current month's spend: already paid for active AND cancelling subs
  const currentMonthlySpend = useMemo(() => {
    return subscriptions
      .filter((s) => s.status !== "cancelled")
      .reduce((sum, s) => {
        const price = s.price || 0;
        return sum + (s.billing === "Yearly" ? price / 12 : price);
      }, 0);
  }, [subscriptions]);

  // Projected future monthly spend: only subs that will auto-renew
  const projectedFutureSpend = useMemo(() => {
    return subscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, s) => {
        const price = s.price || 0;
        return sum + (s.billing === "Yearly" ? price / 12 : price);
      }, 0);
  }, [subscriptions]);

  // Active access count (both active and cancelling have access during current period)
  const activeCount = useMemo(() => {
    return subscriptions.filter((s) => s.status === "active" || s.status === "cancelling").length;
  }, [subscriptions]);

  const value = useMemo(
    () => ({
      subscriptions,
      upcomingSubscriptions,
      currentMonthlySpend,
      projectedFutureSpend,
      totalMonthlySpend: currentMonthlySpend,
      activeCount,
      addSubscription,
      toggleAutoRenew,
      reactivateSubscription,
      deleteSubscription,
    }),
    [
      subscriptions,
      upcomingSubscriptions,
      currentMonthlySpend,
      projectedFutureSpend,
      activeCount,
      addSubscription,
      toggleAutoRenew,
      reactivateSubscription,
      deleteSubscription,
    ],
  );

  return (
    <SubscriptionsContext.Provider value={value}>
      {children}
    </SubscriptionsContext.Provider>
  );
};

export const useSubscriptions = () => {
  const context = useContext(SubscriptionsContext);
  if (!context) {
    throw new Error("useSubscriptions must be used within a SubscriptionsProvider");
  }
  return context;
};
