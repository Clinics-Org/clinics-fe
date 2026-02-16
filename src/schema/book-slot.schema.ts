import { validatePhoneNumber } from '@/utils/phone-validation';
import { z } from 'zod';

export const SOURCE = {
  PHONE: 'PHONE',
  WHATSAPP: 'WHATSAPP',
  WALK_IN: 'WALK_IN',
  WEBSITE: 'WEBSITE',
  OTHER: 'OTHER',
};

export const bookSlotSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  mobile: z.string().superRefine((val, ctx) => {
    const validation = validatePhoneNumber(val);
    if (!validation.isValid) {
      ctx.addIssue({
        code: 'custom',
        message: validation.error || 'Please enter a valid mobile number',
      });
    }
  }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    message: 'Gender is required',
  }),
  source: z.enum(Object.values(SOURCE)).optional(),
});
