package com.spreetail.expense.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.logging.Logger;

@Service
public class EmailService {

    private static final Logger logger = Logger.getLogger(EmailService.class.getName());

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Value("${app.frontend.url}")
    private String appUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    private String getSpreetailHtmlTemplate(String title, String heading, String bodyContent, String buttonText, String buttonLink) {
        String buttonHtml = "";
        if (buttonText != null && buttonLink != null) {
            buttonHtml = String.format(
                "<div style=\"text-align: center; margin-top: 30px;\">" +
                "<a href=\"%s\" style=\"background-color: #09cca9; color: #0e1214; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;\">%s</a>" +
                "</div>", buttonLink, buttonText);
        }

        return String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset=\"utf-8\">" +
            "<title>%s</title>" +
            "</head>" +
            "<body style=\"margin: 0; padding: 0; background-color: #0e1214; font-family: 'Inter', Helvetica, Arial, sans-serif; color: #ffffff;\">" +
            "<table width=\"100%%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color: #0e1214;\">" +
            "<tr>" +
            "<td align=\"center\" style=\"padding: 40px 0;\">" +
            "<table width=\"600\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color: #1a1e23; border-radius: 12px; border: 1px solid #2a2e33;\">" +
            "<tr>" +
            "<td style=\"padding: 30px 40px; text-align: center; border-bottom: 1px solid #2a2e33;\">" +
            "<h1 style=\"color: #09cca9; margin: 0; font-size: 28px; letter-spacing: -1px;\">Spreetail</h1>" +
            "</td>" +
            "</tr>" +
            "<tr>" +
            "<td style=\"padding: 40px;\">" +
            "<h2 style=\"color: #ffffff; margin-top: 0; margin-bottom: 20px; font-size: 20px;\">%s</h2>" +
            "<div style=\"color: #a0a4a8; font-size: 16px; line-height: 1.6;\">" +
            "%s" +
            "</div>" +
            "%s" +
            "</td>" +
            "</tr>" +
            "<tr>" +
            "<td style=\"padding: 20px 40px; text-align: center; color: #707478; font-size: 12px; border-top: 1px solid #2a2e33;\">" +
            "&copy; 2026 Spreetail Expense Sharing. All rights reserved.<br>This is an automated message." +
            "</td>" +
            "</tr>" +
            "</table>" +
            "</td>" +
            "</tr>" +
            "</table>" +
            "</body>" +
            "</html>", title, heading, bodyContent, buttonHtml);
    }

    @Async
    public void sendEmail(String to, String subject, String htmlContent) {
        if (senderEmail == null || senderEmail.isEmpty()) {
            logger.warning("Email sending bypassed: No MAIL_USERNAME configured. Would have sent email to " + to + " with subject: " + subject);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(senderEmail, "Spreetail Expenses");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML
            
            mailSender.send(message);
            logger.info("Successfully sent email to " + to);
            
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            logger.severe("Failed to send email to " + to + ": " + e.getMessage());
        } catch (Exception e) {
            logger.severe("Unexpected error sending email: " + e.getMessage());
        }
    }

    public void sendGroupCreationEmail(String to, String username, String groupName, Long groupId) {
        String title = "Group Created";
        String heading = "You've created a new group!";
        String content = String.format("<p>Hi %s,</p><p>Your group <strong>%s</strong> was created successfully. You can now invite your friends and start splitting expenses seamlessly.</p>", username, groupName);
        String buttonText = "View Group";
        String buttonLink = appUrl + "/groups/" + groupId;
        
        sendEmail(to, "Group Created: " + groupName, getSpreetailHtmlTemplate(title, heading, content, buttonText, buttonLink));
    }

    public void sendMemberAddedEmail(String to, String username, String groupName, Long groupId) {
        String title = "Added to Group";
        String heading = "You've been added to a group!";
        String content = String.format("<p>Hi %s,</p><p>You have been added to the group <strong>%s</strong>. Log in to view the group and start sharing expenses.</p>", username, groupName);
        String buttonText = "View Group";
        String buttonLink = appUrl + "/groups/" + groupId;
        
        sendEmail(to, "Added to Group: " + groupName, getSpreetailHtmlTemplate(title, heading, content, buttonText, buttonLink));
    }

    public void sendExpenseAddedEmail(String to, String username, String groupName, String expenseDesc, double amount, String currency, String paidByUsername, Long groupId) {
        String title = "New Expense Added";
        String heading = "A new expense was added";
        String content = String.format("<p>Hi %s,</p><p><strong>%s</strong> just added an expense of <strong>%s%.2f</strong> for <em>\"%s\"</em> in your group <strong>%s</strong>.</p>", 
            username, paidByUsername, currency.equals("INR") ? "₹" : "$", amount, expenseDesc, groupName);
        String buttonText = "View Details";
        String buttonLink = appUrl + "/groups/" + groupId;
        
        sendEmail(to, "New Expense: " + expenseDesc, getSpreetailHtmlTemplate(title, heading, content, buttonText, buttonLink));
    }

    public void sendSettlementEmail(String to, String username, String groupName, double amount, String currency, String fromUsername, String toUsername, Long groupId) {
        String title = "Payment Recorded";
        String heading = "A payment was recorded";
        String content = String.format("<p>Hi %s,</p><p>A payment of <strong>%s%.2f</strong> from <strong>%s</strong> to <strong>%s</strong> has been recorded in the group <strong>%s</strong>.</p>", 
            username, currency.equals("INR") ? "₹" : "$", amount, fromUsername, toUsername, groupName);
        String buttonText = "View Balances";
        String buttonLink = appUrl + "/groups/" + groupId;
        
        sendEmail(to, "Payment Recorded in " + groupName, getSpreetailHtmlTemplate(title, heading, content, buttonText, buttonLink));
    }

    public void sendRegistrationOtpEmail(String to, String username, String otp) {
        String title = "Your Spreetail OTP";
        String heading = "Verify your account";
        String content = String.format("<p>Hi %s,</p><p>Thank you for registering with Spreetail. To complete your account setup, please use the following One-Time Password (OTP):</p>" +
                "<div style=\"background-color: #2a2e33; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;\">" +
                "<span style=\"font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #09cca9;\">%s</span>" +
                "</div>" +
                "<p style=\"color: #a0a4a8; font-size: 14px;\">This OTP is valid for 10 minutes. If you didn't request this, you can safely ignore this email.</p>", username, otp);
        
        sendEmail(to, "Your Spreetail Verification Code: " + otp, getSpreetailHtmlTemplate(title, heading, content, null, null));
    }
}
