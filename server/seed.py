import itertools,random
from datetime import datetime, date
from app import create_app
from models import User,Community,UserCommunity,Event,Poll,PollResponse,Transcription,Report,VolunteerHour,Survey,SurveyResponse,db

app = create_app()


def seed_database():
    with app.app_context():
        User.query.delete()
        Community.query.delete()
        UserCommunity.query.delete()
        Event.query.delete()
        Poll.query.delete()
        PollResponse.query.delete()
        Transcription.query.delete()
        Report.query.delete()
        VolunteerHour.query.delete()
        Survey.query.delete()
        SurveyResponse.query.delete()
       
        # Seed data for Users
        user_data = [
            {"username": "john_doe", "email": "john.doe@example.com", "first_name": "John", "last_name": "Doe", "phone_number": "1234567890", "password_hash": "hashed_password_1", "role": "Coordinator"},
            {"username": "winnie_bett", "email": "winnie.bett@example.com", "first_name": "Winnie", "last_name": "Bett", "phone_number": "1122334455", "password_hash": "hashed_password_3", "role": "Member"},
            {"username": "jane_smith", "email": "jane.smith@example.com", "first_name": "Jane", "last_name": "Smith", "phone_number": "075454674", "password_hash": "hashed_password_2", "role": "Administrator"},
            {"username": "sam_wilson", "email": "sam.wilson@example.com", "first_name": "Sam", "last_name": "Wilson", "phone_number": "1122334455", "password_hash": "hashed_password_3", "role": "Coordinator"},
            {"username": "jean_manga", "email": "jean.manga@example.com", "first_name": "Jean", "last_name": "Manga", "phone_number": "074654321", "password_hash": "hashed_password_2", "role": "Volunteer"},
            {"username": "amos_waru", "email": "amos.waru@example.com", "first_name": "Amos", "last_name": "Waru", "phone_number": "0785654321", "password_hash": "hashed_password_2", "role": "Volunteer"}


          
        ]

        users = []
        for user_info in user_data:
            user = User(**user_info)
            users.append(user)
            db.session.add(user)
        db.session.commit()

        # Seed data for Communities
        community_data = [
            {"name": "Tech Innovators", "description": "A community of tech enthusiasts and innovators", "coordinator_id": users[0].id},
            {"name": "Health Advocates", "description": "A community focused on health and wellness", "coordinator_id": users[3].id}
        ]

        communities = []
        for community_info in community_data:
            community = Community(**community_info)
            communities.append(community)
            db.session.add(community)
        db.session.commit()

        # Seed data for UserCommunities
        user_community_data = [
            {"user_id": users[0].id, "community_id": communities[0].id},
            {"user_id": users[1].id, "community_id": communities[0].id},
            {"user_id": users[2].id, "community_id": communities[1].id}
        ]

        user_communities = []
        for uc_info in user_community_data:
            user_community = UserCommunity(**uc_info)
            user_communities.append(user_community)
            db.session.add(user_community)
        db.session.commit()

        # Seed data for Events
        event_data = [
            {"title": "Tech Meetup", "description": "A meetup for tech enthusiasts", "event_date": datetime(2024, 8, 1, 17, 0), "start_time": datetime(2024, 8, 1, 17, 0), "end_time": datetime(2024, 8, 1, 19, 0), "zoom_link": "http://example.com/tech_meetup", "community_id": communities[0].id, "coordinator_id": users[0].id},
            {"title": "Health Webinar", "description": "A webinar on health and wellness", "event_date": datetime(2024, 8, 10, 10, 0), "start_time": datetime(2024, 8, 10, 10, 0), "end_time": datetime(2024, 8, 10, 12, 0), "zoom_link": "http://example.com/health_webinar", "community_id": communities[1].id, "coordinator_id": users[2].id}
        ]

        events = []
        for event_info in event_data:
            event = Event(**event_info)
            events.append(event)
            db.session.add(event)
        db.session.commit()

        # Seed data for Polls
        poll_data = [
            {"question": "What is your favorite programming language?", "options": {"A": "Python", "B": "JavaScript", "C": "Java", "D": "Other"}, "event_id": events[0].id, "poll_owner_id": users[0].id},
            {"question": "How often do you exercise?", "options": {"A": "Daily", "B": "Weekly", "C": "Monthly", "D": "Rarely"}, "event_id": events[1].id, "poll_owner_id": users[2].id}
        ]

        polls = []
        for poll_info in poll_data:
            poll = Poll(**poll_info)
            polls.append(poll)
            db.session.add(poll)
        db.session.commit()

        # Seed data for PollResponses
        poll_response_data = [
            {"poll_id": polls[0].id, "user_id": users[0].id, "response": "A"},
            {"poll_id": polls[0].id, "user_id": users[1].id, "response": "B"},
            {"poll_id": polls[1].id, "user_id": users[2].id, "response": "A"}
        ]

        poll_responses = []
        for pr_info in poll_response_data:
            poll_response = PollResponse(**pr_info)
            poll_responses.append(poll_response)
            db.session.add(poll_response)
        db.session.commit()

        # Seed data for Transcriptions
        transcription_data = [
            {"event_id": events[0].id, "transcribed_content": "This is the transcription for the tech meetup.", "summary": "Tech meetup on programming languages."},
            {"event_id": events[1].id, "transcribed_content": "This is the transcription for the health webinar.", "summary": "Health webinar on exercise routines."}
        ]

        transcriptions = []
        for transcription_info in transcription_data:
            transcription = Transcription(**transcription_info)
            transcriptions.append(transcription)
            db.session.add(transcription)
        db.session.commit()

        # Seed data for Reports
        report_data = [
            {"event_id": events[0].id, "num_attendees": 50, "overview": "The tech meetup had 50 attendees and discussed various programming languages.", "user_id": users[0].id},
            {"event_id": events[1].id, "num_attendees": 30, "overview": "The health webinar had 30 attendees and focused on exercise routines.", "user_id": users[2].id}
        ]

        reports = []
        for report_info in report_data:
            report = Report(**report_info)
            reports.append(report)
            db.session.add(report)
        db.session.commit()

        # Seed data for VolunteerHours
        volunteer_hour_data = [
            {"user_id": users[4].id, "date": datetime(2024, 7, 15), "hours": 2.5, "event_id": events[0].id,"approved_by":users[0].id,"approved_at":datetime(2024, 7, 16)},
            {"user_id": users[5].id, "date": datetime(2024, 7, 20), "hours": 1.0, "event_id": events[1].id,"approved_by":users[3].id,"approved_at":datetime(2024, 7, 16)}
          
        ]

        volunteer_hours = []
        for vh_info in volunteer_hour_data:
            volunteer_hour = VolunteerHour(**vh_info)
            volunteer_hours.append(volunteer_hour)
            db.session.add(volunteer_hour)
        db.session.commit()

        # Seed data for Surveys
        survey_data = [
            {"title": "Tech Survey", "questions": [{"question": "Do you enjoy programming?", "type": "yes_no"}, {"question": "What is your favorite language?", "type": "text"}], "survey_owner_id": users[0].id},
            {"title": "Health Survey", "questions": [{"question": "Do you exercise regularly?", "type": "yes_no"}, {"question": "What is your favorite exercise?", "type": "text"}], "survey_owner_id": users[2].id}
        ]

        surveys = []
        for survey_info in survey_data:
            survey = Survey(**survey_info)
            surveys.append(survey)
            db.session.add(survey)
        db.session.commit()

        # Seed data for SurveyResponses
        survey_response_data = [
            {"survey_id": surveys[0].id, "user_id": users[0].id, "responses": {"Do you enjoy programming?": "yes", "What is your favorite language?": "Python"}},
            {"survey_id": surveys[0].id, "user_id": users[1].id, "responses": {"Do you enjoy programming?": "no", "What is your favorite language?": "JavaScript"}},
            {"survey_id": surveys[1].id, "user_id": users[2].id, "responses": {"Do you exercise regularly?": "yes", "What is your favorite exercise?": "Running"}}
        ]

        survey_responses = []
        for sr_info in survey_response_data:
            survey_response = SurveyResponse(**sr_info)
            survey_responses.append(survey_response)
            db.session.add(survey_response)
        db.session.commit()
if __name__ == "__main__":
    seed_database()