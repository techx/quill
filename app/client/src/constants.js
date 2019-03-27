const angular = require('angular');

angular.module('reg')
    .constant('EVENT_INFO', {
        NAME: 'HackSC 2019',
    })
    .constant('DASHBOARD', {
        UNVERIFIED: 'You should have received an email asking you verify your email. Click the link in the email and you can start your application!\nIf you haven\'t received an email, your school may be blocking our emails. Sign up with a gmail account and we will verify your student status another way. For further issues, contact us at team@hacksc.com.',
        INCOMPLETE_TITLE: 'You still need to complete your application!',
        INCOMPLETE: 'If you do not complete your application before [APP_DEADLINE], you will not be considered for admissions.',
        SUBMITTED_TITLE: 'Your application has been submitted!',
        SUBMITTED_BEFORE_DEADLINE: 'Feel free to view it at any time. You can also form a team any time before [APP_DEADLINE]',
        SUBMITTED_AFTER_DEADLINE: 'Feel free to view it at any time. Reviews are now underway, and decisions should come out soon!',
        CLOSED_AND_INCOMPLETE_TITLE: 'Unfortunately, the application window has closed.',
        CLOSED_AND_INCOMPLETE: 'Because you have not submitted your application in time, you will not be eligible to attend HackSC 2019.',
        ADMITTED_AND_CAN_CONFIRM_TITLE: 'You must confirm by [CONFIRM_DEADLINE].',
        ADMITTED_AND_CAN_CONFIRM: '',
        ADMITTED_AND_CANNOT_CONFIRM_TITLE: 'Your confirmation deadline of [CONFIRM_DEADLINE] has passed.',
        ADMITTED_AND_CANNOT_CONFIRM: 'Although you were accepted, you did not complete your confirmation in time.\nUnfortunately, this means that you will not be able to attend the event, as we must begin to accept other applicants on the waitlist.\nWe hope to see you again next year!',
        CONFIRMED_NOT_PAST_TITLE: 'You can edit your confirmation information until [CONFIRM_DEADLINE]',
        REJECTED_TITLE: 'We are unable to admit you at this time.' ,
        REJECTED: '',
        WAITLISTED_TITLE: 'Space is limited, but we want you to come!',
        WAITLISTED: '',
        DECLINED: 'We\'re sorry to hear that you won\'t be able to make it to HackSC 2019! We hope you see you again soon.',
    })
    .constant('APPLICATION', {
        ESSAY1_TITLE: 'Why do you want to attend HackSC?',
        ESSAY1_PLACEHOLDER: '',
        ESSAY2_TITLE: 'Tell us about one of your projects (technical or non-technical) that you\'re most proud of.',
        ESSAY2_PLACEHOLDER: '',
        ESSAY3_TITLE: 'What is something you\'d like to see in the next 10 years?',
        ESSAY3_PLACEHOLDER: ''
    })
    .constant('TEAM',{
        NO_TEAM_REG_CLOSED: 'Unfortunately, it\'s too late apply with a team.\nHowever, you can still form teams on your own before or during the event!',
    });
