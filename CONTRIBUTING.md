Contributing
============

All kinds of contributions to Quill are greatly appreciated. For someone
unfamiliar with the code base, the most efficient way to contribute is usually
to submit a [feature request](#feature-requests) or [bug report](#bug-reports).

If you want to dive into the source code, you can submit a [patch](#patches) as
well. Working on [existing issues][issues] is super helpful!

Feature Requests
----------------

Do you have an idea for an awesome new feature for Quill? Please [submit a
feature request][issue]. It's great to hear about new ideas.

If you are inclined to do so, you're welcome to [fork][fork] Quill, work on
implementing the feature yourself, and submit a patch. In this case, it's
*highly recommended* that you first [open an issue][issue] describing your
enhancement to get early feedback on the new feature that you are implementing.
This will help avoid wasted efforts and ensure that your work is incorporated
into the code base.

Bug Reports
-----------

Did something go wrong with Quill? Sorry about that! Bug reports are greatly
appreciated!

When you [submit a bug report][issue], please include relevant information such
as Quill version, operating system, configuration, error messages, and steps to
reproduce the bug. The more details you can include, the easier it is to find
and fix the bug.

Patches
-------

Want to hack on Quill? Awesome!

If there are [open issues][issues], you're more than welcome to work on those -
this is probably the best way to contribute to Quill. If you have your own
ideas, that's great too! In that case, before working on substantial changes to
the code base, it is *highly recommended* that you first [open an issue][issue]
describing what you intend to work on.

**Patches are generally submitted as pull requests.** Patches are also
[accepted over email][email].

Any changes to the code base should follow the style and coding conventions
used in the rest of the project. The version history should be clean, and
commit messages should be descriptive and [properly formatted][commit-messages].

Testing
-------

### Accessibility
Testing for accessibility is a great way to make sure that all hackathon 
enthusiasts can use Quill, regardless of ability. It's good practice to run 
accessibility tests on any changes that you've made to ensure that no new 
accessibility errors were introduced.

An accessibility testing tool, pa11y-ci, has been provided and configured for 
this project. To run pa11y-ci, make sure that Quill is running locally on 
http://localhost:3000/ (alternatively, you can change the URLs specified in 
`.pa11yci` to match those of your running instance). Then, run the command 
`npm run test:accessibility`. If several of the URLs checked by pa11y-ci 
produce the same number of errors, pa11y-ci may be having trouble logging in 
with the default admin credentials specified in `.env`. Check that your 
instance of Quill is running correctly, or change the credentials used in 
`.pa11yci`.

If your contribution adds any new pages to Quill, please add them to 
`.pa11yci` to make sure that these pages are covered by the accessibility 
tests. If your new pages are accessed as a non-logged-in user, add them at the 
beginning of the URL list. If they are accessed when logged in, add them after 
the URL with actions to log in.

For more information on pa11y-ci, please visit [pa11y-ci] and [pa11y], 
in particular the [section on actions][pa11y-actions].

---

If you have any questions about anything, feel free to [ask][email]!

*Thanks to Anish Athalye for allowing Quill to shamelessly steal this contributing guide from [Gavel][gavel]!*

[issue]: https://github.com/techx/quill/issues/new
[issues]: https://github.com/techx/quill/issues
[fork]: https://github.com/techx/quill/fork
[email]: mailto:quill@hackmit.org
[commit-messages]: http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html
[gavel]: https://github.com/anishathalye/gavel
[pa11y-ci]: https://github.com/pa11y/pa11y-ci
[pa11y]: https://github.com/pa11y/pa11y
[pa11y-actions]: https://github.com/pa11y/pa11y#actions
