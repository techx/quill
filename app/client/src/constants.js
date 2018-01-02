angular.module('reg')
    .constant('EVENT_INFO', {
        NAME: 'VTHacks V - 2018',
    })
    .constant('DASHBOARD', {
        UNVERIFIED: 'You should have received an email asking you verify your email. Click the link in the email and you can start your application!',
        INCOMPLETE_TITLE: 'You still need to complete your application!',
        INCOMPLETE: 'You need to complete an application to be considered for the event!',
        SUBMITTED_TITLE: 'Your application has been submitted!',
        SUBMITTED: 'Feel free to edit it at any time. \nAdmissions will be determined on a first come, first serve basis. Please make sure your information is accurate before the event!',
        CLOSED_AND_INCOMPLETE_TITLE: 'Unfortunately, registration has closed.',
        CLOSED_AND_INCOMPLETE: 'Registartion ended [APP_DEADLINE]. If you have any questions or concerns about this, please contact [hackathon@vthacks.com](mailto:hackathon@vthacks.com).',
        ADMITTED_AND_CAN_CONFIRM_TITLE: 'You must confirm your account.',
        ADMITTED_AND_CANNOT_CONFIRM_TITLE: 'Unfortunately, the confirmation period has closed.',
        ADMITTED_AND_CANNOT_CONFIRM: 'The confirmation period ended [CONFIRM_DEADLINE]. If you have any questions or concerns about this, please contact [hackathon@vthacks.com](mailto:hackathon@vthacks.com).',
        ADMITTED_AND_CANNOT_CONFIRM: 'Although you were accepted, you did not complete your confirmation in time.\nUnfortunately, this means that you will not be able to attend the event.\nWe hope to see you again next year!',
        CONFIRMED_NOT_PAST_TITLE: 'You can still edit your confirmation information.',
        DECLINED: 'We\'re sorry to hear that you won\'t be able to make it to VTHacks V! :(\nMaybe next year! We hope you see you again soon.',
    })
    .constant('TEAM',{
        NO_TEAM_REG_CLOSED: 'Unfortunately, it\'s too late to enter with a team.\nHowever, you can still form teams on your own before or during the event!',
    });
