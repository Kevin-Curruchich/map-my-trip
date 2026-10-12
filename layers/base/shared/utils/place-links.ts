export function instagramUrl(handle: string) {
  return handle.startsWith("http")
    ? handle
    : `https://instagram.com/${handle.replace(/^@/, "")}`;
}

export function whatsappUrl(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}
