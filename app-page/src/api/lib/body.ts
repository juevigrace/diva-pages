export async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return request.json();
  }
  const fd = await request.formData();
  return Object.fromEntries(fd.entries());
}
