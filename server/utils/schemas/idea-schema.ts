import * as z from "zod/v4";

export const ideaSchema = z
  .array(
    z.object({
      id: z.string().describe("Unique identifier for the idea"),
      title: z.string().describe("Title of the idea"),
      text: z.string().describe("Detailed description of the idea"),
      icon: z.string().optional().describe("Emoji ascii icon for the idea"),
    })
  )
  .describe("List of trip ideas");

export type IdeaSchema = z.infer<typeof ideaSchema>;
