package com.kuraflow.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender emailSender;

    public void sendStreakReminderEmail(String to, String displayName, int currentStreak) {
        log.info("Sending streak reminder email to {}", to);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            // Using a dummy sender address for now
            message.setFrom("noreply@kuraflow.com");
            message.setTo(to);
            message.setSubject("Keep your streak alive, " + displayName + "! 🔥");
            message.setText("Hi " + displayName + ",\n\n" +
                    "Your current streak is " + currentStreak + " days! Don't lose your progress.\n" +
                    "Log in to KuraFlow and complete a lesson today to keep your streak alive.\n\n" +
                    "Happy learning,\nThe KuraFlow Team");
            
            emailSender.send(message);
            log.info("Streak reminder email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
        }
    }
}
