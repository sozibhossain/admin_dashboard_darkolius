export const formatDateTime = (value?: string | Date | null) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const formatDate = (value?: string | Date | null) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
};

export const formatNumber = (value?: number | null) => {
  if (typeof value !== "number") {
    return "0";
  }

  return new Intl.NumberFormat("en-US").format(value);
};
