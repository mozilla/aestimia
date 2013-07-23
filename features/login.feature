Feature: Logging In

  Scenario: Mentor logs in with nothing to review
    When a Mentor logs in to Aestimia
    And there are no submissions for them to review
    Then they should see the text "No badges to review right now! Good job mentor team. You deserve a party."

  Scenario: Mentor logs in with something to review
    When a Mentor logs in to Aestimia
    And there is a submission for them to review
    Then they should see the text "These badges are ready for your review!"
