// Import all Cloud Functions
const notifications = require('./notifyAppointment');

// Export all functions
module.exports = {
  sendWhatsApp: notifications.sendWhatsApp,
  sendDailyReminders: notifications.sendDailyReminders,
  onAppointmentStatusChange: notifications.onAppointmentStatusChange,
  recommendDoctors: notifications.recommendDoctors,
  getDoctorAISummary: require('./doctorSummary').getDoctorAISummary
};
