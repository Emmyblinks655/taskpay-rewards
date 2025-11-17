import { z } from 'zod';

// Admin Tasks validation
export const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().trim().min(1, "Description is required").max(1000, "Description must be less than 1000 characters"),
  link: z.string().trim().url("Must be a valid URL").max(500, "Link must be less than 500 characters"),
  reward: z.number().min(0.01, "Reward must be at least 0.01").max(10000, "Reward must be less than 10,000"),
  type: z.enum(['twitter_follow', 'instagram_follow', 'youtube_subscribe', 'telegram_join', 'platform_signup', 'visit_url']),
  status: z.boolean()
});

// Payout request validation
export const payoutSchema = z.object({
  amount: z.number().min(10, "Minimum payout is $10").max(10000, "Maximum payout is $10,000"),
  method: z.enum(['bank', 'crypto', 'mobile_money']),
  accountDetails: z.string().trim().min(5, "Account details required").max(500, "Account details too long")
});

// Free accounts validation
export const freeAccountSchema = z.object({
  platform_name: z.string().trim().min(1, "Platform name is required").max(100, "Platform name too long"),
  username: z.string().trim().min(1, "Username is required").max(100, "Username too long"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password too long")
});

// Ads validation
export const adSchema = z.object({
  ad_name: z.string().trim().min(1, "Ad name is required").max(200, "Ad name too long"),
  ad_type: z.enum(['code', 'image']),
  ad_content: z.string().trim().min(1, "Ad content is required").max(5000, "Ad content too long"),
  placement: z.array(z.enum(['homepage', 'dashboard', 'tasks', 'free_accounts'])).min(1, "Select at least one placement")
});

// Task submission validation
export const taskSubmissionSchema = z.object({
  username_proof: z.string().trim().max(100, "Username too long").optional(),
  proof_image: z.string().optional()
}).refine(
  data => data.username_proof || data.proof_image,
  { message: "Either username proof or image proof is required" }
);
