# Website feedback dialog

`shared/feedback.js` opens the shared feedback dialog. Its `APPS` entries contain
an application slug, display name, repository and visibility. Public applications,
including IFCCAD, disclose GitHub publication before submitting to
`https://open-feedback-studio.pages.dev/api/feedback`. Reply email is sent as a
separate API field and is not included in the public message.

IFCCAD maps to `OpenAEC-Foundation/ifccad`. Before deploying this website change,
ensure Open Feedback Studio has migration `006_enable_ifccad_issues.sql` applied
and its public-route Functions deployed. The GitHub App must have issue access
to that repository. The client shows an issue link only when the API returns one;
a stored submission without an issue URL is acknowledged without claiming publication.
Existing private submissions are not republished by this website change.

Check the dialog's disclosure, routing and receipt behavior without sending real
feedback:

```text
node --test scripts/check-feedback.test.cjs
node --check shared/feedback.js
```

The server caches shared script URLs as immutable for one week. When changing
feedback behavior, update the feedback script version consistently in all HTML
pages; the current reference is /shared/feedback.js?v=20261102.
