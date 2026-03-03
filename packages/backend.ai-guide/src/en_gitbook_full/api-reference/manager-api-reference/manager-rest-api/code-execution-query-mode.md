---
title: Code Execution (Query Mode)
order: 161
---
# Code Execution (Query Mode)

## Executing Snippet

* URI: `/session/:id`
* Method: `POST`

Executes a snippet of user code using the specified session. Each execution request to a same session may have side-effects to subsequent executions. For instance, setting a global variable in a request and reading the variable in another request is completely legal. It is the job of the user (or the front-end) to guarantee the correct execution order of multiple interdependent requests. When the session is terminated or restarted, all such volatile states vanish.

### Parameters


| Parameter | Type | Description |
| --- | --- | --- |
| :id | slug | The session ID. |
| mode | str | A constant string "query". |
| code | str | A string of user-written code. All non-ASCII data must be encoded in UTF-8 or any format acceptable by the session. |
| runId | str | A string of client-side unique identifier for this particular run. For more details about the concept of a run, see Code Execution Model. If not given, the API server will assign a random one in the first response and the client must use it for the same run afterwards. |



**Example:**

```bash
{
  "mode": "query",
  "code": "print('Hello, world!')",
  "runId": "5facbf2f2697c1b7"
}
```

### Response

| HTTP Status Code | Description                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| 200 OK           | The session has responded with the execution result. The response body contains a JSON object as described below. |

| Fields   | Type     | Values                                                                                                                |
| -------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `result` | `object` | [Execution Result Object](https://docs.backend.ai/en/latest/manager/common-api/objects.html#execution-result-object). |

:::info
**Note**

Even when the user code raises exceptions, such queries are treated as successful execution. i.e., The failure of this API means that our API subsystem had errors, not the user codes.
:::

:::warning
**Warning**

If the user code tries to breach the system, causes crashes (e.g., segmentation fault), or runs too long (timeout), the session is automatically terminated. In such cases, you will get incomplete console logs with `"finished"` status earlier than expected. Depending on situation, the `result.stderr` may also contain specific error information.
:::

Here we demonstrate a few example returns when various Python codes are executed.

**Example: Simple return.**

```bash
print("Hello, world!")
```

```bash
{
  "result": {
    "runId": "5facbf2f2697c1b7",
    "status": "finished",
    "console": [
      ["stdout", "Hello, world!\n"]
    ],
    "options": null
  }
}
```

**Example: Runtime error.**

```bash
a = 123
print('what happens now?')
a = a / 0
```

```bash
{
  "result": {
    "runId": "5facbf2f2697c1b7",
    "status": "finished",
    "console": [
      ["stdout", "what happens now?\n"],
      ["stderr", "Traceback (most recent call last):\n  File \"<input>\", line 3, in <module>\nZeroDivisionError: division by zero"],
    ],
    "options": null
  }
}
```

**Example: Multimedia output.**

Media outputs are also mixed with other console outputs according to their execution order.

```bash
import matplotlib.pyplot as plt
a = [1,2]
b = [3,4]
print('plotting simple line graph')
plt.plot(a, b)
plt.show()
print('done')
```

```bash
{
  "result": {
    "runId": "5facbf2f2697c1b7",
    "status": "finished",
    "console": [
      ["stdout", "plotting simple line graph\n"],
      ["media", ["image/svg+xml", "<?xml version=\"1.0\" ..."]],
      ["stdout", "done\n"]
    ],
    "options": null
  }
}
```

**Example: Continuation results.**

```bash
import time
for i in range(5):
    print(f"Tick {i+1}")
    time.sleep(1)
print("done")
```

```bash
{
  "result": {
    "runId": "5facbf2f2697c1b7",
    "status": "continued",
    "console": [
      ["stdout", "Tick 1\nTick 2\n"]
    ],
    "options": null
  }
}
```

Here you should make another API query with the empty `code` field.

```bash
{
  "result": {
    "runId": "5facbf2f2697c1b7",
    "status": "continued",
    "console": [
      ["stdout", "Tick 3\nTick 4\n"]
    ],
    "options": null
  }
}
```

Again.

```bash
{
  "result": {
    "runId": "5facbf2f2697c1b7",
    "status": "finished",
    "console": [
      ["stdout", "Tick 5\ndone\n"],
    ],
    "options": null
  }
}
```

**Example: User input.**

```bash
print("What is your name?")
name = input(">> ")
print(f"Hello, {name}!")
```

```bash
{
  "result": {
    "runId": "5facbf2f2697c1b7",
    "status": "waiting-input",
    "console": [
      ["stdout", "What is your name?\n>> "]
    ],
    "options": {
      "is_password": false
    }
  }
}
```

You should make another API query with the `code` field filled with the user input.

```bash
{
  "result": {
    "runId": "5facbf2f2697c1b7",
    "status": "finished",
    "console": [
      ["stdout", "Hello, Lablup!\n"]
    ],
    "options": null
  }
}
```

## Auto-completion

* URI: `/session/:id/complete`
* Method: `POST`

### Parameters


| Parameter | Type | Description |
| --- | --- | --- |
| :id | slug | The session ID. |
| code | str | A string containing the code until the current cursor position. |
| options.post | str | A string containing the code after the current cursor position. |
| options.line | str | A string containing the content of the current line. |
| options.row | int | An integer indicating the line number (0-based) of the cursor. |
| options.col | int | An integer indicating the column number (0-based) in the current line of the cursor. |



**Example:**

```bash
{
  "code": "pri",
  "options": {
    "post": "\nprint(\"world\")\n",
    "line": "pri",
    "row": 0,
    "col": 3
  }
}
```

### Response

| HTTP Status Code | Description                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| 200 OK           | The session has responded with the execution result. The response body contains a JSON object as described below. |


| Fields | Type | Values |
| --- | --- | --- |
| result | list[str] | An ordered list containing the possible auto-completion matches as strings. This may be empty if the current session does not implement auto-completion or no matches have been found.Selecting a match and merging it into the code text are up to the front-end implementation. |



**Example:**

```bash
{
  "result": [
    "print",
    "printf"
  ]
}
```

### Interrupt

* URI: `/session/:id/interrupt`
* Method: `POST`

### Parameters

| Parameter | Type   | Description     |
| --------- | ------ | --------------- |
| `:id`     | `slug` | The session ID. |

### Response

| HTTP Status Code | Description                                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| 204 No Content   | Sent the interrupt signal to the session. Note that this does _not_ guarantee the effectiveness of the interruption. |

[ ](https://docs.backend.ai/en/latest/manager/user-api/sessions.html)[\
](https://www.facebook.com/lablupInc)
