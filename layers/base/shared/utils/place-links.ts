export function instagramUrl(handle: string) {
  return /^https?:\/\//.test(handle)
    ? handle
    : `https://instagram.com/${handle.replace(/^@/, "")}`;
}

export function whatsappUrl(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}
