<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\GenderController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AthleteController;
use App\Http\Controllers\Api\SportController;
use App\Http\Controllers\Api\CoachController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\RecordController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MedicalRecordController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\PracticeScheduleController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AthleteProfileController;
use App\Http\Controllers\Api\CoachProfileController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\AthleteDocumentController;
use App\Http\Controllers\Api\AcademicRecordController;
use App\Http\Controllers\Api\EquipmentController;
use App\Http\Controllers\Api\EquipmentRequestController;
use App\Http\Controllers\Api\GameReportController;
use App\Http\Controllers\Api\PracticeReportController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Account Management Routes
    Route::prefix('account')->group(function () {
        Route::get('/profile', [AuthController::class, 'getProfile']);
        Route::put('/update-profile', [AuthController::class, 'updateProfile']);
        Route::put('/update-username', [AuthController::class, 'updateUsername']);
        Route::put('/change-password', [AuthController::class, 'changePassword']);
        Route::post('/upload-profile-picture', [AuthController::class, 'uploadProfilePicture']);
        Route::delete('/remove-profile-picture', [AuthController::class, 'removeProfilePicture']);
    });

    // Athlete Profile Routes
    Route::controller(AthleteProfileController::class)->prefix('/athlete-profile')->group(function () {
        Route::get('/all', 'getAllDashboardData');
        Route::get('/my-profile', 'getMyProfile');
        Route::get('/my-medical-records', 'getMyMedicalRecords');
        Route::get('/my-practice-schedules', 'getMyPracticeSchedules');
        Route::get('/my-records', 'getMyRecords');
        Route::put('/update-profile', 'updateMyProfile');
    });

    // Coach Profile Routes
    Route::controller(CoachProfileController::class)->prefix('/coach-profile')->group(function () {
        Route::get('/all', 'getAllDashboardData');
        Route::get('/my-profile', 'getMyProfile');
        Route::get('/my-athletes', 'getMyAthletes');
        Route::get('/my-practice-schedules', 'getMyPracticeSchedules');
        Route::get('/upcoming-events', 'getUpcomingEvents');
        Route::get('/dashboard-stats', 'getDashboardStats');
        Route::put('/update-profile', 'updateMyProfile');
    });

    // Gender Routes
    Route::controller(GenderController::class)->prefix('/gender')->group(function () {
        Route::get('/loadGenders', 'loadGenders');
        Route::get('/getGender/{genderId}', 'getGender');
        Route::post('/storeGender', 'storeGender');
        Route::put('/updateGender/{gender}', 'updateGender');
        Route::put('/destroyGender/{gender}', 'destroyGender');
    });

    // User Routes
    Route::controller(UserController::class)->prefix('/user')->group(function () {
        Route::get('/loadUsers', 'loadUsers');
        Route::post('/storeUser', 'storeUser');
        Route::put('/updateUser/{user}', 'updateUser');
        Route::put('/destroyUser/{user}', 'destroyUser');
        Route::put('/resetPassword/{user}', [UserController::class, 'resetPassword']);
    });

    // Athlete Routes
    Route::prefix('athlete')->group(function () {
        Route::get('/loadAthletes', [AthleteController::class, 'loadAthletes']);
        Route::get('/getAthlete/{athleteId}', [AthleteController::class, 'getAthlete']);
        Route::get('/my-status', [AthleteController::class, 'getMyStatus']);
        Route::post('/storeAthlete', [AthleteController::class, 'storeAthlete']);
        Route::put('/updateAthlete/{athlete:athlete_id}', [AthleteController::class, 'updateAthlete']);
        Route::put('/destroyAthlete/{athlete:athlete_id}', [AthleteController::class, 'destroyAthlete']);
        Route::put('/toggleStatus/{athlete}', [AthleteController::class, 'toggleAthleteStatus']);
    });

    // Sport Routes
    Route::controller(SportController::class)->prefix('/sport')->group(function () {
        Route::get('/loadSports', 'loadSports');
        Route::get('/getSport/{sportId}', 'getSport');
        Route::post('/storeSport', 'storeSport');
        Route::put('/updateSport/{sport}', 'updateSport');
        Route::put('/destroySport/{sport}', 'destroySport');
    });

    // Coach Routes
    Route::controller(CoachController::class)->prefix('/coach')->group(function () {
        Route::get('/loadCoaches', 'loadCoaches');
        Route::get('/getCoachAthletes/{coachId}', 'getCoachAthletes');
        Route::post('/storeCoach', 'storeCoach');
        Route::put('/updateCoach/{coach:coach_id}', 'updateCoach');
        Route::put('/destroyCoach/{coach:coach_id}', 'destroyCoach');
    });

    // Event Routes
    Route::controller(EventController::class)->prefix('/event')->group(function () {
        Route::get('/loadEvents', 'loadEvents');
        Route::get('/athletes-for-event', 'getAthletesForEvent');
        Route::get('/coaches-for-event', 'getCoachesForEvent');
        Route::get('/participants/{event}', 'getEventParticipants');
        Route::post('/storeEvent', 'storeEvent');
        Route::post('/storeEventWithParticipants', 'storeEventWithParticipants');
        Route::put('/updateEvent/{event}', 'updateEvent');
        Route::put('/updateEventWithParticipants/{event}', 'updateEventWithParticipants');
        Route::put('/destroyEvent/{event}', 'destroyEvent');
    });

    // Record Routes
    Route::controller(RecordController::class)->prefix('/record')->group(function () {
        Route::get('/loadRecords', 'loadRecords');
        Route::post('/storeRecord', 'storeRecord');
        Route::put('/updateRecord/{record}', 'updateRecord');
        Route::put('/destroyRecord/{record}', 'destroyRecord');
    });

    // Dashboard Routes
    Route::controller(DashboardController::class)->prefix('/dashboard')->group(function () {
        Route::get('/all', 'getAllDashboardData');
        Route::get('/stats', 'getStats');
        Route::get('/upcoming-events', 'getUpcomingEvents');
        Route::get('/recent-records', 'getRecentRecords');
        Route::get('/athlete-retention', 'getAthleteRetention');
        Route::get('/sport-participation', 'getSportParticipation');
        Route::get('/search-athletes', 'searchAthletes');
        Route::get('/search-coaches', 'searchCoaches');
    });

    // Medical Record Routes
    Route::controller(MedicalRecordController::class)->prefix('/medical-record')->group(function () {
        Route::get('/athlete/{athleteId}', 'loadMedicalRecordsByAthlete');
        Route::post('/storeMedicalRecord', 'storeMedicalRecord');
        Route::put('/updateMedicalRecord/{medicalRecord}', 'updateMedicalRecord');
        Route::put('/destroyMedicalRecord/{medicalRecord}', 'destroyMedicalRecord');
    });

    // Announcement Routes
    Route::controller(AnnouncementController::class)->prefix('/announcement')->group(function () {
        Route::get('/loadAnnouncements', 'loadAnnouncements');
        Route::post('/storeAnnouncement', 'storeAnnouncement');
        Route::put('/updateAnnouncement/{announcement}', 'updateAnnouncement');
        Route::put('/destroyAnnouncement/{announcement}', 'destroyAnnouncement');
    });

    // Practice Schedule Routes
    Route::controller(PracticeScheduleController::class)->prefix('/practice-schedule')->group(function () {
        Route::get('/loadPracticeSchedules', 'loadPracticeSchedules');
        Route::post('/storePracticeSchedule', 'storePracticeSchedule');
        Route::put('/updatePracticeSchedule/{practiceSchedule}', 'updatePracticeSchedule');
        Route::put('/destroyPracticeSchedule/{practiceSchedule}', 'destroyPracticeSchedule');
        Route::put('/approvePracticeSchedule/{practiceSchedule}', 'approvePracticeSchedule');
        Route::put('/declinePracticeSchedule/{practiceSchedule}', 'declinePracticeSchedule');
    });

    // Attendance Routes
    Route::prefix('attendance')->group(function () {
        Route::get('/practice/{practiceScheduleId}', [AttendanceController::class, 'getAttendanceByPractice']);
        Route::get('/athlete/{athleteId}', [AttendanceController::class, 'getAthleteAttendance']);
        Route::get('/eligible-athletes/{practiceScheduleId}', [AttendanceController::class, 'getEligibleAthletes']);
        Route::get('/all', [AttendanceController::class, 'getAllAttendance']);
        Route::get('/check-eligibility/{practiceScheduleId}', [AttendanceController::class, 'checkAttendanceEligibility']);
        Route::post('/mark', [AttendanceController::class, 'markAttendance']);
        Route::post('/bulk-mark-all-present', [AttendanceController::class, 'bulkMarkAllPresent']);
        Route::post('/bulk-mark-all-absent', [AttendanceController::class, 'bulkMarkAllAbsent']);
        Route::post('/copy-from-previous', [AttendanceController::class, 'copyFromPreviousPractice']);
        Route::put('/update/{attendanceId}', [AttendanceController::class, 'updateAttendance']);
        Route::delete('/delete/{attendanceId}', [AttendanceController::class, 'deleteAttendance']);
        Route::post('/recalculate-all', [AttendanceController::class, 'recalculateAllPercentages']);
    });

    // Report Routes
    Route::controller(ReportController::class)->prefix('/report')->group(function () {
        Route::get('/athlete-demographics', 'getAthleteDemographicsReport');
        Route::get('/attendance-analytics', 'getAttendanceAnalyticsReport');
        Route::get('/event-participation', 'getEventParticipationReport');
        Route::get('/available-sports', 'getAvailableSports');
        Route::get('/available-athletes', 'getAvailableAthletes');
        Route::get('/export-pdf/{reportType}', 'exportReportPDF');
        Route::get('/export-excel/{reportType}', 'exportReportExcel');
    });

    // Athlete Document Routes
    Route::prefix('athlete-documents')->group(function () {
        Route::get('/athlete/{athleteId}', [AthleteDocumentController::class, 'getAthleteDocuments']);
        Route::post('/upload', [AthleteDocumentController::class, 'uploadDocument']);
        Route::get('/download/{documentId}', [AthleteDocumentController::class, 'downloadDocument']);
        Route::put('/status/{documentId}', [AthleteDocumentController::class, 'updateDocumentStatus']);
        Route::delete('/delete/{documentId}', [AthleteDocumentController::class, 'deleteDocument']);
    });

    // Academic Records Routes
    Route::prefix('academic-records')->group(function () {
        Route::post('/upload-grades', [AcademicRecordController::class, 'uploadGrades']);
        Route::get('/athlete/{athleteId}', [AcademicRecordController::class, 'getAthleteAcademicRecords']);
        Route::get('/download-image/{academicRecordId}', [AcademicRecordController::class, 'downloadGradeImage']);
        Route::post('/approve/{academicRecordId}', [AcademicRecordController::class, 'approveRecord']);
        Route::post('/reject/{academicRecordId}', [AcademicRecordController::class, 'rejectRecord']);
        Route::get('/athletes-needing-review', [AcademicRecordController::class, 'getAthletesNeedingReview']);
        Route::post('/review-eligibility/{athleteId}', [AcademicRecordController::class, 'reviewEligibility']);
        Route::post('/expire-grace-periods', [AcademicRecordController::class, 'expireGracePeriods']);
    });

    // Equipment Routes
    Route::controller(EquipmentController::class)->prefix('/equipment')->group(function () {
        Route::get('/loadEquipment', 'loadEquipment');
        Route::get('/getEquipment/{equipmentId}', 'getEquipment');
        Route::post('/storeEquipment', 'storeEquipment');
        Route::put('/updateEquipment/{equipment:equipment_id}', 'updateEquipment');
        Route::put('/destroyEquipment/{equipment:equipment_id}', 'destroyEquipment');
    });

    // Equipment Request Routes
    Route::controller(EquipmentRequestController::class)->prefix('/equipment-request')->group(function () {
        Route::get('/loadRequests', 'loadRequests');
        Route::post('/storeRequest', 'storeRequest');
        Route::put('/approveRequest/{equipmentRequest:request_id}', 'approveRequest');
        Route::put('/rejectRequest/{equipmentRequest:request_id}', 'rejectRequest');
        Route::put('/destroyRequest/{equipmentRequest:request_id}', 'destroyRequest');
        Route::post('/markAsPrinted', 'markAsPrinted');
    });

    // Game Report Routes
    Route::controller(GameReportController::class)->prefix('/game-report')->group(function () {
        Route::get('/data', 'getGameReport');
        Route::get('/export-pdf', 'exportGameReportPDF');
        Route::get('/export-excel', 'exportGameReportExcel');
    });

    // Practice Report Routes
    Route::controller(PracticeReportController::class)->prefix('/practice-report')->group(function () {
        Route::get('/data', 'getPracticeReport');
        Route::get('/export-pdf', 'exportPracticeReportPDF');
        Route::get('/export-excel', 'exportPracticeReportExcel');
        Route::get('/available-coaches', 'getAvailableCoaches');
    });
});
