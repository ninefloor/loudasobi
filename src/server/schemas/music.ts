import { z } from "zod";
import { fanLightKeys } from "@/lib/fanlights";

export const musicSettingsSchema = z
  .object({
    youtubeId: z
      .union([
        z
          .string()
          .trim()
          .regex(/^[A-Za-z0-9_-]{11}$/),
        z.literal(""),
        z.null(),
      ])
      .transform((value) => value || null),
    fanLightColor: z.enum(fanLightKeys).nullable(),
    bpm: z.number().finite().min(20).max(400).nullable(),
    publish: z.boolean(),
    syncOffset: z.number().finite().min(-3600).max(3600),
  })
  .strict()
  .refine((value) => !value.publish || value.youtubeId !== null, {
    message: "공개하려면 11자리 YouTube ID를 입력해 주세요.",
    path: ["youtubeId"],
  });
export type MusicSettingsInput = z.infer<typeof musicSettingsSchema>;
