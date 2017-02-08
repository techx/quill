angular.module('reg')
    .constant('EVENT_INFO', {
        name: 'HackMIT 2015',
    })
    .constant('DASH_TXT', {
        unverified: 'You should have received an email asking you verify your email. Click the link in the email and you can start your application!',
        incompleteTitle: 'You still need to complete your application!',
        incomplete: 'If you do not complete your application before the [APP_DEADLINE], you will not be considered for the admissions lottery!',
        submittedTitle: 'Your application has been submitted!',
        submitted: 'Feel free to edit it at any time. However, once registration is closed, you will not be able to edit it any further.\nAdmissions will be determined by a random lottery. Please make sure your information is accurate before registration is closed!',
        closedAndIncompleteTitle: 'Unfortunately, registration has closed, and the lottery process has begun.',
        closedAndIncomplete: 'Because you have not completed your profile in time, you will not be eligible for the lottery process.',
        admittedAndCanConfirmTitle: 'You must confirm by [CONFIRM_DEADLINE].',
        admittedAndCannotConfirmTitle: 'Your confirmation deadline of [CONFIRM_DEADLINE] has passed.',
        admittedAndCannotConfirm: 'Although you were accepted, you did not complete your confirmation in time.\nUnfortunately, this means that you will not be able to attend the event, as we must begin to accept other applicants on the waitlist.\nWe hope to see you again next year!',
        confirmedNotPastTitle: 'You can edit your confirmation information until [CONFIRM_DEADLINE]',
        declined: 'We\'re sorry to hear that you won\'t be able to make it to HackMIT 2015! :(\nMaybe next year! We hope you see you again soon.',
    });
