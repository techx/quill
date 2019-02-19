angular.module('reg')
    .factory('MailService', [
        '$http',
        function($http){
            var base = '/api/mail/';
            var verified_title = 'Thank you for verifying your email!';
            var verified_text = "<p>Thank you for verifying your email! Now that we know that you're a real, living, breathing, beautiful person,\n" +
                "    we'd like to remind you of some upcoming opportunities and deadlines from HackSC.<br/><br/>We can't\n" +
                "    stress this enough: finish your <a href=\"https://apply.hacksc.com\" target=\"_blank\" rel=\"noopener\">application</a> as\n" +
                "    soon as possible. Admissions are sent out on a rolling basis and our 800 available slots are filling up\n" +
                "    fast.<br/><br/>Make sure you keep up to date with HackSC happenings on Facebook! Follow us both our <a\n" +
                "            href=\"https://www.facebook.com/hackscofficial/?ref=br_rs\" target=\"_blank\" rel=\"noopener\">main page</a> and\n" +
                "    our <a href=\"https://www.facebook.com/events/290482594997517/\" target=\"_blank\" rel=\"noopener\">event page</a> to be\n" +
                "    alerted about exciting sponsors, new developments, and general upcoming information.<br/>For many California\n" +
                "    schools, we have special event pages where you can come together with your peers from your community to organize\n" +
                "    teams and ideas for the April summit. <br/>Register with your respective group to find out more!<br/> <a\n" +
                "            href=\"https://www.facebook.com/events/284086188936209/\" target=\"_blank\" rel=\"noopener\">Cal Poly Pomona\n" +
                "        Storms HackSC 2019</a><br/> <a href=\"https://www.facebook.com/events/302382230478821/\" target=\"_blank\"\n" +
                "                                       rel=\"noopener\">Cal Poly SLO Storms HackSC 2019</a><br/> <a\n" +
                "            href=\"https://www.facebook.com/events/322061758434120/\" target=\"_blank\" rel=\"noopener\">Stanford Storms\n" +
                "        HackSC 2019</a> <br/> <a href=\"https://www.facebook.com/events/349666215633740/\">UCLA Storms HackSC 2019</a>\n" +
                "    <br/> <a href=\"https://www.facebook.com/events/373148296834948/\" target=\"_blank\" rel=\"noopener\">UCI Storms HackSC\n" +
                "        2019</a> <br/> <a href=\"https://www.facebook.com/events/380098005873195/\">UCR Storms HackSC 2019</a><br/> <a\n" +
                "            href=\"https://www.facebook.com/events/770027986704880/\" target=\"_blank\" rel=\"noopener\">UCSD Storms HackSC\n" +
                "        2019</a> <br/> <a href=\"https://www.facebook.com/events/869008373444071/\" target=\"_blank\" rel=\"noopener\">CalTech\n" +
                "        Storms HackSC 2019</a><br/> <a href=\"https://www.facebook.com/events/1204885276302745/\" target=\"_blank\"\n" +
                "                                       rel=\"noopener\">UCSB Storms HackSC 2019</a><br/> <a\n" +
                "            href=\"https://www.facebook.com/events/2306022846332257/\" target=\"_blank\" rel=\"noopener\">Bay Area Storms\n" +
                "        HackSC 2019</a><br/><br/>If you're a USC student who needs to stay busy in the interim between now and\n" +
                "    HackSC on April 12, feel free to join us every Wednesday at GroundZero cafe for <a\n" +
                "            href=\"https://www.facebook.com/events/288801028472022/\" target=\"_blank\" rel=\"noopener\">HackSC Presents: Hack\n" +
                "        Nights</a>! Hack Nights are a weekly opportunity for cooperation and community-building centered around a weekly\n" +
                "    theme. Each Hack Night allows for an environment to work on personal projects and homework, as well as unique\n" +
                "    workshops and presentations from speakers.<br/>Come by for the Hack Nights and feel free to feast upon free food and\n" +
                "    giveaways! Our grand prize will be an Xbox One S, so make sure you keep showing up!<br/><br/>For more detailed\n" +
                "    breakdowns of what we've been up to, check us out on our <a\n" +
                "            href=\"https://medium.com/@hacksc/hacksc-2019-ready-to-blossom-be1c6aca1980\" target=\"_blank\" rel=\"noopener\">Medium</a>\n" +
                "    blog, and for appreciation of our stunning aesthetic and 280-character wit, follow us on <a\n" +
                "            href=\"https://www.instagram.com/hackscofficial/\" target=\"_blank\" rel=\"noopener\">Instagram</a> and <a\n" +
                "            href=\"https://twitter.com/hackscofficial\" target=\"_blank\" rel=\"noopener\">Twitter</a> respectively!</p>\n";

            return {

                // ----------------------
                // Admin Actions
                // ----------------------

                sendMail: function(sender, title, text, recipient){
                    return $http.put(base + 'send', {
                        sender: sender,
                        title: title,
                        text: text,
                        recipient: recipient
                    });
                },

                sendVerifiedMail: function(sender, recipient){
                    return $http.put(base + 'send', {
                        sender: sender,
                        title: verified_title,
                        text: verified_text,
                        recipient: recipient
                    });
                }
            };
        }
    ]);
