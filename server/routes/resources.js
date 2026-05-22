const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  res.json({
    howToReport: [
      {
        step: 1,
        title: 'Choose a category',
        detail: 'Select the category that best describes the issue. For example, select Electrical for power related problems or Plumbing for water related issues.'
      },
      {
        step: 2,
        title: 'Select your building',
        detail: 'Choose the correct St Marys building from the list. Options include Waldegrave Suite, K Block, 1850 Theatre and all other blocks.'
      },
      {
        step: 3,
        title: 'Describe the issue clearly',
        detail: 'Include what the problem is, where exactly it is, and when you first noticed it. The more detail you provide the faster the Facilities Team can respond.'
      },
      {
        step: 4,
        title: 'Add a photo if possible',
        detail: 'A photo helps the Facilities Team understand the issue before they arrive. Upload your photo to any cloud service and paste the link into the form.'
      },
      {
        step: 5,
        title: 'Submit and track',
        detail: 'Once submitted you can track the status of your issue on your dashboard. You will see updates as the Facilities Team works on it.'
      }
    ],
    safetyNotes: [
      'If the issue is an immediate safety hazard such as a gas leak, flooding or fire risk, call St Marys Security immediately and do not wait to submit an online report.',
      'Do not attempt to fix any electrical faults yourself.',
      'If a fire exit is blocked call Security immediately.',
      'For medical emergencies call 999 first then notify Security.'
    ],
    privacyNotice: 'Reficere is a campus maintenance platform for St Marys University Twickenham. Your name and email are stored solely to manage your reports and notify you of updates. Your data is not shared with any third parties. You may request deletion of your account and data at any time by contacting the IT Helpdesk.',
    contactInfo: {
      facilitiesTeam: 'facilities@stmarys.ac.uk',
      itHelpdesk: 'helpdesk@stmarys.ac.uk',
      security: 'security@stmarys.ac.uk',
      emergency: '999'
    }
  });
});

module.exports = router;