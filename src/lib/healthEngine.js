import { GHS_SCHEDULE } from "./healthSchedule";

/**
 * Add days, weeks, months, or years to a starting date dynamically.
 */
export function addTimeToDate(dateStr, value, unit) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  const result = new Date(date);
  
  if (unit === "days") {
    result.setDate(result.getDate() + value);
  } else if (unit === "weeks") {
    result.setDate(result.getDate() + value * 7);
  } else if (unit === "months") {
    result.setMonth(result.getMonth() + value);
  } else if (unit === "years") {
    result.setFullYear(result.getFullYear() + value);
  }
  return result.toISOString().slice(0, 10);
}

/**
 * Generates the default schedule dates for a child based strictly on their Date of Birth (DOB).
 */
export function generateDefaultSchedule(dob) {
  if (!dob) return [];
  return GHS_SCHEDULE.map((item) => {
    const scheduledDate = addTimeToDate(dob, item.ageValue, item.ageUnit);
    return {
      scheduleId: item.id,
      activityType: item.activityType,
      title: item.title,
      scheduledDate,
      vaccines: item.vaccines || null,
      dose: item.dose || null,
    };
  });
}

/**
 * Dynamically computes the status of an activity based on the current date,
 * scheduled date, actual completion date, and the health worker's next due date.
 */
export function getActivityStatus(scheduledDate, actualDate, nextDueDate, todayStr) {
  if (actualDate) {
    return "COMPLETED";
  }

  const today = todayStr ? new Date(todayStr) : new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const effectiveDueStr = nextDueDate || scheduledDate;
  if (!effectiveDueStr) return "UPCOMING";

  const dueDate = new Date(effectiveDueStr);
  const dueStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

  const diffTime = dueStart.getTime() - todayStart.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "OVERDUE";
  } else if (diffDays === 0) {
    return "DUE_TODAY";
  } else {
    return "UPCOMING";
  }
}

/**
 * Calculates countdown or elapsed time dynamically.
 */
export function getDaysRemaining(dueDateStr, todayStr) {
  if (!dueDateStr) return null;
  const today = todayStr ? new Date(todayStr) : new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const dueDate = new Date(dueDateStr);
  const dueStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  
  const diffTime = dueStart.getTime() - todayStart.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Builds the comprehensive dashboard metrics and action forms checklist for a child.
 */
export function computeChildHealthSummary(child, todayStr = null) {
  if (!child || !child.dob) return null;

  const defaultSchedule = generateDefaultSchedule(child.dob);
  
  // Merge default schedule with child's recorded activities.
  // Child has records stored in collections or flattened arrays.
  const vaccineRecords = child.vaccineRecords || [];
  const weighingRecords = child.weighingRecords || [];
  const vitaminARecords = child.vitaminARecords || [];
  const dewormingRecords = child.dewormingRecords || [];

  // Combine actual records into maps for fast retrieval by scheduleId / key patterns
  const completedMap = {};
  
  vaccineRecords.forEach(r => {
    if (r.scheduleId) completedMap[r.scheduleId] = r;
  });
  weighingRecords.forEach(r => {
    if (r.scheduleId) completedMap[r.scheduleId] = r;
  });
  vitaminARecords.forEach(r => {
    if (r.scheduleId) completedMap[r.scheduleId] = r;
  });

  const mergedActivities = defaultSchedule.map((sched) => {
    const record = completedMap[sched.scheduleId];
    const actualDate = record ? record.dateGiven || record.dateMeasurement : null;
    const nextDueDate = record ? record.nextVaccineDate || record.nextVisitDate || record.nextVitaminADate : null;

    const status = getActivityStatus(sched.scheduledDate, actualDate, nextDueDate, todayStr);
    
    return {
      ...sched,
      actualDate,
      nextDueDate,
      status,
      record: record || null,
    };
  });

  // Handle deworming separately since it's fully custom/recurring on demand, or generate a base reminder if needed.
  // For deworming, we look at the last record's nextDueDate.
  let latestDeworming = dewormingRecords.length > 0 ? dewormingRecords[dewormingRecords.length - 1] : null;

  // Compute dashboard metrics
  const activeVaccines = mergedActivities.filter(a => a.activityType === "VACCINATION");
  const activeWeighing = mergedActivities.filter(a => a.activityType === "GROWTH_MONITORING");
  const activeVitaminA = mergedActivities.filter(a => a.activityType === "VITAMIN_A");

  const nextVaccine = activeVaccines.find(a => a.status !== "COMPLETED") || null;
  const nextGrowth = activeWeighing.find(a => a.status !== "COMPLETED") || null;
  const nextVitaminA = activeVitaminA.find(a => a.status !== "COMPLETED") || null;

  let dewormingStatus = "No confirmed date";
  let dewormingDays = null;
  let dewormingDate = null;
  if (latestDeworming && latestDeworming.nextDewormingDate) {
    dewormingDate = latestDeworming.nextDewormingDate;
    dewormingDays = getDaysRemaining(dewormingDate, todayStr);
    dewormingStatus = getActivityStatus(null, null, dewormingDate, todayStr);
  }

  // Find due/overdue forms to show
  const dueForms = [];
  mergedActivities.forEach(a => {
    if (a.status === "DUE_TODAY" || a.status === "OVERDUE") {
      dueForms.push(a);
    }
  });

  // Include custom Deworming active form if it has become due/overdue
  if (dewormingStatus === "DUE_TODAY" || dewormingStatus === "OVERDUE") {
    dueForms.push({
      scheduleId: "deworming_due",
      activityType: "DEWORMING",
      title: "Deworming Check",
      scheduledDate: null,
      actualDate: null,
      nextDueDate: dewormingDate,
      status: dewormingStatus,
    });
  }

  // History list
  const history = [];
  vaccineRecords.forEach(r => history.push({ ...r, type: "VACCINATION", date: r.dateGiven }));
  weighingRecords.forEach(r => history.push({ ...r, type: "GROWTH_MONITORING", date: r.dateMeasurement }));
  vitaminARecords.forEach(r => history.push({ ...r, type: "VITAMIN_A", date: r.dateGiven }));
  dewormingRecords.forEach(r => history.push({ ...r, type: "DEWORMING", date: r.dateGiven }));
  history.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Determine if child is registered late and has pending overdue historical records
  const pastUnrecorded = mergedActivities.filter(a => a.status === "OVERDUE");

  return {
    nextVaccine,
    nextGrowth,
    nextVitaminA,
    nextDeworming: dewormingDate ? { date: dewormingDate, days: dewormingDays, status: dewormingStatus } : null,
    dueForms,
    pastUnrecorded,
    history,
    mergedActivities,
  };
}
