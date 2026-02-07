import { useMutation } from '@tanstack/react-query';
import { whatsappService } from '../api/whatsapp.api';

export function useSendVisitConfirmation() {
  return useMutation({
    mutationFn: whatsappService.sendVisitConfirmation,
  });
}

export function useSendPrescription() {
  return useMutation({
    mutationFn: whatsappService.sendPrescription,
  });
}
