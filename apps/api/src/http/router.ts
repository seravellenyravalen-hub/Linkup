export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
export type Handler = (request: Request) => Response | Promise<Response>;

type Route = { method: HttpMethod; path: string; handler: Handler };

export class Router {
  private readonly routes: Route[] = [];

  register(method: string, path: string, handler: Handler) {
    const normalized = method.toUpperCase() as HttpMethod;
    this.routes.push({ method: normalized, path, handler });
  }

  match(method: string, path: string): Handler | null {
    const normalized = method.toUpperCase();
    return this.routes.find((route) => route.method === normalized && route.path === path)?.handler ?? null;
  }

  status(method: string, path: string): 404 | 405 | 200 {
    if (!this.routes.some((route) => route.path === path)) return 404;
    if (!this.routes.some((route) => route.path === path && route.method === method.toUpperCase())) return 405;
    return 200;
  }
}
