---
title: "How I reduced Sparkle's install  size from 464mb to 268mb"
date: "2026-02-26"
description: "A deep dive into optimizing Sparkle's install size by removing bundled dependencies and unused locales."
author: Thedogecraft
coverComponent: sparkle
---

In the Sparkle Patch 2.14.2 I was able to make major size improvements to Sparkle.

![Screenshot 2026-02-26 190638](https://github.com/user-attachments/assets/094349d2-bb94-4db7-ab08-04f52a62cceb)

On the left is sparkle 2.14.1 and on the right is sparkle 2.14.2

Sparkle used to bundle everything in the backend, such as React, PostHog, and even Tailwind with all of their dependencies. All of this led to Sparkle being over 400 MB, with modules duplicated in both the frontend and backend. The ASAR was over 150 MB on its own, and after removing frontend dependencies from the backend, it’s now sitting at just 12 MB that’s a huge difference.

Another thing: for some reason, Electron ships with all locales by default. That folder alone was 43 MB, so cutting it down to just en-US reduced it to only 518 KB.

We also used to include Sentry in both the frontend and backend, but Sentry and its dependencies (like OTEL) were almost 50 MB. We decided to remove Sentry since we don’t really need it users can report issues directly on GitHub.

**Before:**  
![Screenshot 2026-02-26 190527](https://github.com/user-attachments/assets/81be23ba-6251-4382-b4aa-077b8e54f642)

**After:**  
![Screenshot 2026-02-26 190532](https://github.com/user-attachments/assets/a220520d-8528-47d4-b6da-02ee02f6c49c)
