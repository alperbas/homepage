---
title: Semaphore
description: Semaphore Widget Configuration
---

Learn more about [Semaphore](https://github.com/semaphoreui/semaphore).

You can add a new user for homepage under `Users`.

Allowed fields: `["running", "succeeded", "failed"]`.

```yaml
widget:
  type: prowlarr
  url: http://prowlarr.host.or.ip
  key: apikeyapikeyapikeyapikeyapikey
```

```yaml
widget:
  type: semaphore
  url: https://semaphore.host.or.ip
  username: usernameusername
  password: passwordpassword
```
