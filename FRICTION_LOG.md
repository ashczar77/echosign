# EchoSign Friction Log

* **Specific Task Attempted:** 
We wanted to silently trigger an Alexa Smart Home command (e.g., "Turn on the lights") directly from a local React web application running in the Amazon Web App Runtime on Fire TV, without requiring the end-user to perform complex OAuth account-linking.

* **Steps Taken:** 
We researched the Alexa Skills Kit (ASK) and Fire TV Web App documentation looking for a local bridge or intent-triggering API that would allow the browser environment to pass a text string directly to the Fire OS native Alexa agent.

* **Expected vs. Actual Result:** 
*Expected:* A lightweight SDK or `window.amazon` API that allows a verified Fire TV app to pass a local command to the system's Alexa instance. 
*Actual:* There is no way to do this without building a full cloud-hosted Custom Skill, implementing OAuth account linking, and maintaining a server backbone. This level of friction is detrimental to onboarding users with disabilities.

* **Severity Rating:** 
High (Significantly altered the architectural design of our application).

* **Workaround Used:** 
We engineered an "Acoustic Proxy." Since we couldn't trigger Alexa silently via code, we utilized the browser's native `SpeechSynthesis` API to play the translated sign language out loud through the TV speakers. The physical audio wakes up the user's nearby Echo device or Voice Remote naturally.

* **Actionable Suggestion:** 
Expose a secure, permissions-gated Local Intent API within the Amazon Web App Runtime. If a user grants the TV app permission, the web app should be able to pass a simple text string (e.g., `amazon.alexa.triggerIntent("turn on the lights")`) silently to the OS, completely bypassing the need for a cloud backend.
