import itertools,random
from datetime import datetime, date
from app import create_app
from models import User,Community,UserCommunity,Event,Poll,PollResponse,Transcription,Report,VolunteerHour,Survey,SurveyResponse,Tasks,UserTask,Session,Goals,Year,db

app = create_app()


def seed_database():
    with app.app_context():
        User.query.delete()
        Community.query.delete()
        UserCommunity.query.delete()
        UserTask.query.delete()
        Tasks.query.delete()
        Session.query.delete()
        Goals.query.delete()
        Year.query.delete()
        Event.query.delete()
        Poll.query.delete()
        PollResponse.query.delete()
        Transcription.query.delete()
        Report.query.delete()
        VolunteerHour.query.delete()
        Survey.query.delete()
        SurveyResponse.query.delete()

        
        # Create and add years
         # Seed data for Year
        year_data = [
            {"year_name": 2024},
            {"year_name": 2025}
        ]

        
        years = []
        for year_info in year_data:
            year = Year(**year_info)
            years.append(year)
            db.session.add(year)
        db.session.commit()
                # Seed data for Sessions

        # Seed data for Users
        user_data = [
            {"username": "john_doe", "email": "john.doe@example.com", "first_name": "John", "last_name": "Doe", "phone_number": "1234567890", "password": "hashed_password_1", "role": "Coordinator"},
            {"username": "winnie_bett", "email": "winnie.bett@example.com", "first_name": "Winnie", "last_name": "Bett", "phone_number": "1122334455", "password": "hashed_password_2", "role": "Member"},
            {"username": "jane_smith", "email": "jane.smith@example.com", "first_name": "Jane", "last_name": "Smith", "phone_number": "075454674", "password": "hashed_password_3", "role": "Administrator"},
            {"username": "sam_wilson", "email": "sam.wilson@example.com", "first_name": "Sam", "last_name": "Wilson", "phone_number": "1122334455", "password": "hashed_password_1", "role": "Coordinator"},
            {"username": "jean_manga", "email": "jean.manga@example.com", "first_name": "Jean", "last_name": "Manga", "phone_number": "074654321", "password": "hashed_password_2", "role": "Volunteer"},
            {"username": "amos_waru", "email": "amos.waru@example.com", "first_name": "Amos", "last_name": "Waru", "phone_number": "0785654321", "password": "hashed_password_3", "role": "Volunteer"}
        ]

        users = []
        for user_info in user_data:
            user = User(**user_info)
            users.append(user)
            db.session.add(user)
        db.session.commit()
        session_data = [
            {"name": "Q1 2024 Session", "start_date": datetime(2024, 1, 1), "end_date": datetime(2024, 3, 31), "year_id": years[0].id},
            {"name": "Q2 2024 Session", "start_date": datetime(2024, 4, 1), "end_date": datetime(2024, 6, 30), "year_id": years[0].id}
        ]

        # Create and add sessions
        sessions = []
        for session_info in session_data:
            session = Session(**session_info)
            sessions.append(session)
            db.session.add(session)
        db.session.commit()

# Seed data for Goals
        goal_data = [
    {"name": "Develop Marketing Strategy", "description": "Create a comprehensive marketing strategy for Q1", "session_id": sessions[0].id, "year_id": years[0].id,"goal_status":"Achieved"},
    {"name": "Improve Sales Process", "description": "Enhance the sales process based on Q1 results", "session_id": sessions[0].id, "year_id": years[0].id,"goal_status":"Not Yet Achieved"}
]


        # Create and add goals
        goals = []
        for goal_info in goal_data:
            goal = Goals(**goal_info)
            goals.append(goal)
            db.session.add(goal)
        db.session.commit()

        

        # Seed data for Tasks
        task_data = [
            {"name": "Task A", "description": "Description for Task A", "goals_id": goals[0].id, "start_date": datetime(2024, 7, 1), "end_date": datetime(2024, 7, 15), "year_id": years[0].id,"task_status":"Ongoing"},
            {"name": "Task B", "description": "Description for Task B", "goals_id": goals[1].id, "start_date": datetime(2024, 7, 5), "end_date": datetime(2024, 7, 20), "year_id": years[0].id,"task_status":"Ongoing"},
            {"name": "Task C", "description": "Description for Task C", "goals_id": goals[0].id, "start_date": datetime(2024, 7, 10), "end_date": datetime(2024, 7, 25), "year_id": years[0].id,"task_status":"Ongoing"}
        ]

        tasks = []
        for task_info in task_data:
            task = Tasks(**task_info)
            tasks.append(task)
            db.session.add(task)
        db.session.commit()

        # Seed data for UserTasks
        user_task_data = [
            {"user_id": users[0].id, "task_id": tasks[0].id, "assigned_at": datetime(2024, 7, 1), "status": "pending"},
            {"user_id": users[1].id, "task_id": tasks[1].id, "assigned_at": datetime(2024, 7, 5), "status": "completed"},
            {"user_id": users[2].id, "task_id": tasks[2].id, "assigned_at": datetime(2024, 7, 10), "status": "in-progress"},
            {"user_id": users[3].id, "task_id": tasks[0].id, "assigned_at": datetime(2024, 7, 1), "status": "pending"},
            {"user_id": users[4].id, "task_id": tasks[1].id, "assigned_at": datetime(2024, 7, 5), "status": "pending"},
            {"user_id": users[5].id, "task_id": tasks[2].id, "assigned_at": datetime(2024, 7, 10), "status": "completed"}
        ]

        user_tasks = []
        for user_task_info in user_task_data:
            user_task = UserTask(**user_task_info)
            user_tasks.append(user_task)
            db.session.add(user_task)
        db.session.commit()


        # Seed data for Communities
        community_data = [
            {"name": "Tech Innovators", "description": "A community of tech enthusiasts and innovators", "coordinator_id": users[0].id,"goal_id":goals[0].id,"task_id":tasks[0].id},
            {"name": "Health Advocates", "description": "A community focused on health and wellness", "coordinator_id": users[3].id,"goal_id":goals[1].id,"task_id":tasks[1].id}
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
            {"title": "Tech Conference 2024", "description": "A conference about the latest in technology.", "event_date": datetime(2024, 8, 10), "start_time": datetime(2024, 8, 10, 9, 0), "end_time": datetime(2024, 8, 10, 17, 0), "zoom_link": "https://zoom.us/j/1234567890", "community_id": 1, "coordinator_id": users[0].id},
            {"title": "Health Workshop", "description": "A workshop focusing on health and wellness.", "event_date": datetime(2024, 8, 15), "start_time": datetime(2024, 8, 15, 10, 0), "end_time": datetime(2024, 8, 15, 14, 0), "zoom_link": "https://zoom.us/j/0987654321", "community_id": 2, "coordinator_id": users[3].id}
        ]

        events = []
        for event_info in event_data:
            event = Event(**event_info)
            events.append(event)
            db.session.add(event)
        db.session.commit()

        # Seed data for Polls
        poll_data = [
            {"question": "What is your favorite tech topic?", "options": {"Option 1": "AI", "Option 2": "Blockchain", "Option 3": "Cybersecurity"}, "poll_start_date": datetime(2024, 8, 1), "poll_stop_date": datetime(2024, 8, 10), "event_id": events[0].id, "poll_owner_id": users[0].id},
            {"question": "How often do you exercise?", "options": {"Option 1": "Daily", "Option 2": "Weekly", "Option 3": "Monthly"}, "poll_start_date": datetime(2024, 8, 5), "poll_stop_date": datetime(2024, 8, 15), "event_id": events[1].id, "poll_owner_id": users[3].id}
        ]

        polls = []
        for poll_info in poll_data:
            poll = Poll(**poll_info)
            polls.append(poll)
            db.session.add(poll)
        db.session.commit()

        # Seed data for PollResponses
        poll_response_data = [
            {"poll_id": polls[0].id, "user_id": users[1].id, "response": "AI"},
            {"poll_id": polls[0].id, "user_id": users[2].id, "response": "Blockchain"},
            {"poll_id": polls[1].id, "user_id": users[4].id, "response": "Daily"},
            {"poll_id": polls[1].id, "user_id": users[5].id, "response": "Weekly"}
        ]

        poll_responses = []
        for poll_response_info in poll_response_data:
            poll_response = PollResponse(**poll_response_info)
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
            {"user_id": users[4].id, "date": date(2024, 7, 20), "hours": 4.0, "event_id": events[0].id, "task_id": tasks[0].id, "approved_by": users[0].id, "approved_at": datetime(2024, 7, 22)},
            {"user_id": users[5].id, "date": date(2024, 8, 5), "hours": 3.5, "event_id": events[1].id, "task_id": tasks[1].id, "approved_by": users[3].id, "approved_at": datetime(2024, 8, 7)}
        ]

        volunteer_hours = []
        for vh_info in volunteer_hour_data:
            volunteer_hour = VolunteerHour(**vh_info)
            volunteer_hours.append(volunteer_hour)
            db.session.add(volunteer_hour)
        db.session.commit()

        # Seed data for Surveys
        survey_data = [
            {"title": "Tech Conference Feedback", "questions": {"Q1": "How would you rate the conference?", "Q2": "What was the highlight of the event?"}, "survey_start_date": datetime(2024, 8, 10), "survey_stop_date": datetime(2024, 8, 20), "survey_owner_id": users[0].id},
            {"title": "Workshop Feedback", "questions": {"Q1": "Was the workshop useful?", "Q2": "What can be improved?"}, "survey_start_date": datetime(2024, 8, 15), "survey_stop_date": datetime(2024, 8, 25), "survey_owner_id": users[3].id}
        ]

        surveys = []
        for survey_info in survey_data:
            survey = Survey(**survey_info)
            surveys.append(survey)
            db.session.add(survey)
        db.session.commit()

        # Seed data for SurveyResponses
        survey_response_data = [
            {"survey_id": surveys[0].id, "user_id": users[1].id, "responses": {"Q1": "Excellent", "Q2": "The keynote speech"}},
            {"survey_id": surveys[0].id, "user_id": users[2].id, "responses": {"Q1": "Good", "Q2": "Networking opportunities"}},
            {"survey_id": surveys[1].id, "user_id": users[4].id, "responses": {"Q1": "Yes", "Q2": "More interactive sessions"}},
            {"survey_id": surveys[1].id, "user_id": users[5].id, "responses": {"Q1": "No", "Q2": "More practical examples"}}
        ]

        survey_responses = []
        for survey_response_info in survey_response_data:
            survey_response = SurveyResponse(**survey_response_info)
            survey_responses.append(survey_response)
            db.session.add(survey_response)
        db.session.commit()
    

    
       

if __name__ == "__main__":
    seed_database()