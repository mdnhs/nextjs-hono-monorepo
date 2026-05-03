import { z } from 'zod';

export const shippingAddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().min(1, 'Phone number is required'),
});

export const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  discountCode: z.string().optional(),
  locationId: z.string().optional(),
});
