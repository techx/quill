const angular = require('angular');

angular.module('reg')
    .constant('EVENT_INFO', {
        NAME: 'HackTX 2020',
    })
    .constant('DASHBOARD', {
        UNVERIFIED: 'You should have received an email asking you verify your email. Click the link in the email and you can start your application!',
        INCOMPLETE_TITLE: 'You still need to complete your application!',
        INCOMPLETE: 'If you do not complete your application before the [APP_DEADLINE], you will not be considered for the admissions lottery!',
        SPONSOR_PENDING: 'We\'re working on confirming your sponsorship status! You should hear back from us soon.',
        SPONSOR_CONFIRMED: 'We\'ve confirmed your sponsorship status! You can now view student resumes by accessing the Resumes panel.',
        SPONSOR_INCOMPLETE: 'Please complete the Sponsor Application to be granted access to our resume book!',
        SPONSOR_COMPLETE: 'Once we confirm your sponsorship status, you will have access to our resume book! ',
        SPONSOR_GRANTED_ACCESS: 'You have access to our resume book!',
        SUBMITTED_TITLE: 'Your application has been submitted!',
        SUBMITTED: 'Feel free to edit it at any time. However, once registration is closed, you will not be able to edit it any further.\nAdmissions will be determined by a random lottery. Please make sure your information is accurate before registration is closed!',
        CLOSED_AND_INCOMPLETE_TITLE: 'Unfortunately, registration has closed, and the lottery process has begun.',
        CLOSED_AND_INCOMPLETE: 'Because you have not completed your profile in time, you will not be eligible for the lottery process.',
        ADMITTED_AND_CAN_CONFIRM_TITLE: 'You must confirm by [CONFIRM_DEADLINE].',
        ADMITTED_AND_CANNOT_CONFIRM_TITLE: 'Your confirmation deadline of [CONFIRM_DEADLINE] has passed.',
        ADMITTED_AND_CANNOT_CONFIRM: 'Although you were accepted, you did not complete your confirmation in time.\nUnfortunately, this means that you will not be able to attend the event, as we must begin to accept other applicants on the waitlist.\nWe hope to see you again next year!',
        CONFIRMED_NOT_PAST_TITLE: 'You can edit your confirmation information until [CONFIRM_DEADLINE]',
        DECLINED: 'We\'re sorry to hear that you won\'t be able to make it to Wholesome Hacks 2018! :(\nMaybe next year! We hope you see you again soon.',
    })
    .constant('TEAM',{
        NO_TEAM_REG_CLOSED: 'Unfortunately, it\'s too late to enter the lottery with a team.\nHowever, you can still form teams on your own before or during the event!',
    })
    .constant('SPONSORSHIP_COST', {
        KILO: 500,
        MEGA: 1000,
        GIGA: 3000,
        TITLE: 5000,
        WORKSHOP: 750,
        TIMED_COST: 500,
        TIMED_RATE: 30,
    });
