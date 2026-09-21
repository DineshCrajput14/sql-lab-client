import { TestBed } from "@angular/core/testing";
import { WindowRefService } from "./window-ref.service";

describe("WindowRefService", () => {
  let service: WindowRefService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WindowRefService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should return the native window object", () => {
    const nativeWindow = service.nativeWindow;
    expect(nativeWindow).toBe(window);
  });

  it("should call the _window function when accessing nativeWindow", () => {
    const windowSpy = jest.spyOn(service as any, "nativeWindow", "get");
    const result = service.nativeWindow;

    expect(windowSpy).toHaveBeenCalled();
    expect(result).toBe(window);
  });
});
