<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/phpmailer/PHPMailer.php';
require __DIR__ . '/phpmailer/SMTP.php';
require __DIR__ . '/phpmailer/Exception.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
    exit;
}

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "message" => "Invalid email"]);
    exit;
}

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'dilshajinfotech.it@gmail.com';
    $mail->Password   = 'gwgqrgtjekiljkiy'; // NO SPACES
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    $mail->setFrom('dilshajinfotech.it@gmail.com', 'Dilshaj Infotech');
    $mail->addAddress('dilshajinfotech.it@gmail.com');
    $mail->addReplyTo($email, $name ?: 'Website User');

    // Extract all potential fields
    $rawFormType = trim($_POST['form_type'] ?? 'Contact Form');
    $phone = trim($_POST['phone'] ?? 'Not provided');
    $subjectField = trim($_POST['subject'] ?? 'No Subject');
    $specialization = trim($_POST['specialization'] ?? '');
    $role = trim($_POST['role'] ?? ''); // Capture Role

    // Normalize and Map Form Types to Custom Headings/Subjects
    $emailHeading = $rawFormType;
    $emailSubject = "$rawFormType - $name";

    switch ($rawFormType) {
        case 'Value Courses Application':
            $emailHeading = 'Value Courses';
            $emailSubject = "Value Courses Application - $name";
            break;
        case 'Internship Application':
            $emailHeading = 'Internship Request';
            $emailSubject = "Internship Request - $name";
            break;
        case 'Project Idea':
        case 'Project Idea Form':
        case 'Home Page Contact Form': // Fallback if user uses this
            $emailHeading = '<b>The Project Idea Discussion from the User</b>';
            $emailSubject = "The Project Idea Discussion - $name";
            break;
        case 'Collaboration Form':
            $emailHeading = 'Collaboration Form';
            $emailSubject = "Collaboration Form - $name";
            break;
        case 'Latest Updates Request':
        case 'Newsletter Subscription':
            $emailHeading = 'Latest Updates Request';
            $emailSubject = "Latest Updates Request - $email"; // Use email as name might not be present
            break;
    }

    // Set dynamic subject
    $mail->Subject = $emailSubject;
    
    // Construct HTML Body
    $mail->isHTML(true);
    
    $emailContent = "
    <h2>$emailHeading</h2>
    <table border='1' cellpadding='10' cellspacing='0' style='border-collapse: collapse; width: 100%; max-width: 600px;'>
        <tr>
            <td style='background-color: #f2f2f2; width: 30%;'><strong>Name</strong></td>
            <td>$name</td>
        </tr>
        <tr>
            <td style='background-color: #f2f2f2;'><strong>Email</strong></td>
            <td>$email</td>
        </tr>
        <tr>
            <td style='background-color: #f2f2f2;'><strong>Phone</strong></td>
            <td>$phone</td>
        </tr>";

    if ($role) {
        $emailContent .= "
        <tr>
            <td style='background-color: #f2f2f2;'><strong>Role Applying For</strong></td>
            <td>$role</td>
        </tr>";
    }

    if ($specialization) {
        $emailContent .= "
        <tr>
            <td style='background-color: #f2f2f2;'><strong>Specialization</strong></td>
            <td>$specialization</td>
        </tr>";
    }

    if ($subjectField && $subjectField !== 'No Subject') {
        $emailContent .= "
        <tr>
            <td style='background-color: #f2f2f2;'><strong>Subject</strong></td>
            <td>$subjectField</td>
        </tr>";
    }

    $emailContent .= "
        <tr>
            <td style='background-color: #f2f2f2;'><strong>Message</strong></td>
            <td>" . nl2br(htmlspecialchars($message)) . "</td>
        </tr>
    </table>
    <br>
    <p><small>Sent from Dilshaj Infotech Website</small></p>
    ";

    $mail->Body = $emailContent;
    $mail->AltBody = "Subject: $emailSubject\nName: $name\nEmail: $email\nPhone: $phone\nMessage: $message";

    // --- FILE ATTACHMENT LOGIC ---
    if (isset($_FILES['resume']) && $_FILES['resume']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['resume']['tmp_name'];
        $fileName = $_FILES['resume']['name'];
        $fileSize = $_FILES['resume']['size'];
        $fileType = $_FILES['resume']['type'];
        $fileNameCmps = explode(".", $fileName);
        $fileExtension = strtolower(end($fileNameCmps));

        // Allowed extensions
        $allowedfileExtensions = array('pdf', 'doc', 'docx');

        if (in_array($fileExtension, $allowedfileExtensions)) {
            // Limit size (e.g. 5MB)
            if ($fileSize < 5242880) {
                // Attach file to PHPMailer
                $mail->addAttachment($fileTmpPath, $fileName);
            } else {
                 echo json_encode(["status" => "error", "message" => "File is too large. Max 5MB."]);
                 exit;
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid file type. Only PDF, DOC, DOCX allowed."]);
            exit;
        }
    }

    $mail->send();

    echo json_encode([
        "status" => "success",
        "message" => "Thank you! Your message has been sent."
    ]);
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Mailer Error: " . $mail->ErrorInfo
    ]);
}
