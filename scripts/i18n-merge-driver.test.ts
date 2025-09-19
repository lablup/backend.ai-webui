import { readFileSync } from "fs";

// Mock fs functions
jest.mock("fs", () => ({
  readFileSync: jest.fn(),
}));

// Mock process.exit to avoid test termination
const mockExit = jest.fn();
process.exit = mockExit as any;

// Import functions from the actual implementation
const {
  readJSON,
  deepEqual,
  diffLeaves,
  setAt,
  pathKey,
} = require("./i18n-merge-driver");

const mockReadFileSync = readFileSync as jest.MockedFunction<
  typeof readFileSync
>;

describe("i18n-merge-driver utility functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("readJSON", () => {
    it("should parse JSON from file correctly", () => {
      const mockData = '{"test": "value"}';
      mockReadFileSync.mockReturnValue(mockData);

      const result = readJSON("test.json");

      expect(mockReadFileSync).toHaveBeenCalledWith("test.json", "utf8");
      expect(result).toEqual({ test: "value" });
    });

    it("should throw error for invalid JSON", () => {
      mockReadFileSync.mockReturnValue("{invalid json}");

      expect(() => readJSON("invalid.json")).toThrow();
    });
  });

  describe("deepEqual", () => {
    it("should return true for identical objects", () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 2 } };
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it("should return false for different objects", () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 3 } };
      expect(deepEqual(obj1, obj2)).toBe(false);
    });

    it("should handle primitive values", () => {
      expect(deepEqual("test", "test")).toBe(true);
      expect(deepEqual("test", "different")).toBe(false);
      expect(deepEqual(123, 123)).toBe(true);
      expect(deepEqual(123, 456)).toBe(false);
    });
  });

  describe("diffLeaves", () => {
    it("should return empty array for identical objects", () => {
      const base = { a: 1, b: 2 };
      const changed = { a: 1, b: 2 };

      expect(diffLeaves(base, changed)).toEqual([]);
    });

    it("should detect simple value changes", () => {
      const base = { a: 1, b: 2 };
      const changed = { a: 1, b: 3 };

      const diff = diffLeaves(base, changed);

      expect(diff).toEqual([{ path: ["b"], value: 3 }]);
    });

    it("should detect new properties", () => {
      const base = { a: 1 };
      const changed = { a: 1, b: 2 };

      const diff = diffLeaves(base, changed);

      expect(diff).toEqual([{ path: ["b"], value: 2 }]);
    });

    it("should detect removed properties", () => {
      const base = { a: 1, b: 2 };
      const changed = { a: 1 };

      const diff = diffLeaves(base, changed);

      expect(diff).toEqual([{ path: ["b"], value: undefined }]);
    });

    it("should handle nested object changes", () => {
      const base = { a: { x: 1, y: 2 } };
      const changed = { a: { x: 1, y: 3 } };

      const diff = diffLeaves(base, changed);

      expect(diff).toEqual([{ path: ["a", "y"], value: 3 }]);
    });

    it("should handle deep nested changes", () => {
      const base = {
        users: {
          john: { age: 30, city: "NYC" },
          jane: { age: 25, city: "LA" },
        },
      };
      const changed = {
        users: {
          john: { age: 31, city: "NYC" },
          jane: { age: 25, city: "SF" },
        },
      };

      const diff = diffLeaves(base, changed);

      expect(diff).toEqual([
        { path: ["users", "john", "age"], value: 31 },
        { path: ["users", "jane", "city"], value: "SF" },
      ]);
    });
  });

  describe("setAt", () => {
    it("should set value at simple path", () => {
      const obj = { a: 1 };
      const result = setAt(obj, ["b"], 2);

      expect(result).toEqual({ a: 1, b: 2 });
    });

    it("should set value at nested path", () => {
      const obj = { a: { x: 1 } };
      const result = setAt(obj, ["a", "y"], 2);

      expect(result).toEqual({ a: { x: 1, y: 2 } });
    });

    it("should create nested objects if they don't exist", () => {
      const obj = {};
      const result = setAt(obj, ["a", "b", "c"], "value");

      expect(result).toEqual({ a: { b: { c: "value" } } });
    });

    it("should delete property when value is undefined", () => {
      const obj = { a: 1, b: 2 };
      const result = setAt(obj, ["b"], undefined);

      expect(result).toEqual({ a: 1 });
      expect("b" in result).toBe(false);
    });

    it("should return value directly for empty path", () => {
      const result = setAt({}, [], "newValue");
      expect(result).toBe("newValue");
    });

    it("should handle deep deletion", () => {
      const obj = { a: { b: { c: 1, d: 2 } } };
      const result = setAt(obj, ["a", "b", "c"], undefined);

      expect(result).toEqual({ a: { b: { d: 2 } } });
    });
  });

  describe("pathKey", () => {
    it("should join path elements with separator", () => {
      expect(pathKey(["a", "b", "c"])).toBe("a\x1fb\x1fc");
    });

    it("should handle empty path", () => {
      expect(pathKey([])).toBe("");
    });

    it("should handle single element path", () => {
      expect(pathKey(["only"])).toBe("only");
    });
  });
});

describe("i18n-merge-driver integration scenarios", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle typical i18n merge scenario without conflicts", () => {
    const base = {
      $schema: "schema.json",
      greeting: "Hello",
      farewell: "Goodbye",
    };

    const ours = {
      $schema: "schema.json",
      greeting: "Hi there",
      farewell: "Goodbye",
    };

    const theirs = {
      $schema: "schema.json",
      greeting: "Hello",
      farewell: "See you later",
      welcome: "Welcome",
    };

    const dOurs = diffLeaves(base, ours);
    const dTheirs = diffLeaves(base, theirs);

    expect(dOurs).toEqual([{ path: ["greeting"], value: "Hi there" }]);

    expect(dTheirs).toEqual([
      { path: ["farewell"], value: "See you later" },
      { path: ["welcome"], value: "Welcome" },
    ]);

    // Apply changes
    let result = JSON.parse(JSON.stringify(base));
    for (const e of dOurs) result = setAt(result, e.path, e.value);
    for (const e of dTheirs) result = setAt(result, e.path, e.value);

    expect(result).toEqual({
      $schema: "schema.json",
      farewell: "See you later",
      greeting: "Hi there",
      welcome: "Welcome",
    });
  });

  it("should detect conflicts when both sides modify same key", () => {
    const base = { greeting: "Hello" };
    const ours = { greeting: "Hi there" };
    const theirs = { greeting: "Hey" };

    const dOurs = diffLeaves(base, ours);
    const dTheirs = diffLeaves(base, theirs);

    const mOurs = new Map(dOurs.map((e: any) => [pathKey(e.path), e]));
    const mTheirs = new Map(dTheirs.map((e: any) => [pathKey(e.path), e]));

    let hasConflict = false;
    for (const [k, o] of mOurs) {
      if (mTheirs.has(k)) {
        const t = mTheirs.get(k)!;
        if (!deepEqual((o as any).value, (t as any).value)) {
          hasConflict = true;
          break;
        }
      }
    }

    expect(hasConflict).toBe(true);
  });

  it("should not detect conflict when both sides make same change", () => {
    const base = { greeting: "Hello" };
    const ours = { greeting: "Hi there" };
    const theirs = { greeting: "Hi there" };

    const dOurs = diffLeaves(base, ours);
    const dTheirs = diffLeaves(base, theirs);

    const mOurs = new Map(dOurs.map((e: any) => [pathKey(e.path), e]));
    const mTheirs = new Map(dTheirs.map((e: any) => [pathKey(e.path), e]));

    let hasConflict = false;
    for (const [k, o] of mOurs) {
      if (mTheirs.has(k)) {
        const t = mTheirs.get(k)!;
        if (!deepEqual((o as any).value, (t as any).value)) {
          hasConflict = true;
          break;
        }
      }
    }

    expect(hasConflict).toBe(false);
  });

  it("should handle complex nested i18n structure", () => {
    const base = {
      $schema: "schema.json",
      pages: {
        login: {
          title: "Login",
          fields: {
            username: "Username",
            password: "Password",
          },
        },
        dashboard: {
          welcome: "Welcome back",
        },
      },
    };

    const ours = {
      $schema: "schema.json",
      pages: {
        login: {
          title: "Sign In",
          fields: {
            username: "Username",
            password: "Password",
          },
        },
        dashboard: {
          welcome: "Welcome back",
        },
      },
    };

    const theirs = {
      $schema: "schema.json",
      pages: {
        login: {
          title: "Login",
          fields: {
            username: "User ID",
            password: "Password",
          },
        },
        dashboard: {
          welcome: "Welcome back",
          stats: "Statistics",
        },
      },
    };

    const dOurs = diffLeaves(base, ours);
    const dTheirs = diffLeaves(base, theirs);

    expect(dOurs).toEqual([
      { path: ["pages", "login", "title"], value: "Sign In" },
    ]);

    expect(dTheirs).toEqual([
      { path: ["pages", "login", "fields", "username"], value: "User ID" },
      { path: ["pages", "dashboard", "stats"], value: "Statistics" },
    ]);

    // Merge without conflicts
    let result = JSON.parse(JSON.stringify(base));
    for (const e of dOurs) result = setAt(result, e.path, e.value);
    for (const e of dTheirs) result = setAt(result, e.path, e.value);

    expect(result.pages.login.title).toBe("Sign In");
    expect(result.pages.login.fields.username).toBe("User ID");
    expect(result.pages.dashboard.stats).toBe("Statistics");
  });
});
