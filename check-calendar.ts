import { getCalendarClient } from "./src/lib/google-auth.ts";
import { serverEnv } from "./src/env.ts";

async function checkCalendar() {
  try {
    const calendar = await getCalendarClient();
    const calendarId = "legnp@bplen.com";
    
    console.log(`Checking metadata for calendar: ${calendarId}`);
    const res = await calendar.calendars.get({
      calendarId: calendarId,
    });
    
    console.log("Calendar Metadata:", JSON.stringify(res.data, null, 2));
    
    if (res.data.conferenceProperties) {
      console.log("Supported Conference Types:", res.data.conferenceProperties.allowedConferenceSolutionTypes);
    } else {
      console.log("No conference properties found for this calendar.");
    }
  } catch (err) {
    console.error("Error checking calendar:", err);
  }
}

checkCalendar();
