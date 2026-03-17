import { z } from "zod";

// Basic Puck data schema example. Adjust fields as needed for your site.
export const PuckDataSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      label: z.string(),
      visible: z.boolean(),
      // Add more fields as needed
    })
  ),
});
