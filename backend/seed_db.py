import asyncio
import uuid
from app.core.config import settings
from supabase import create_client, Client

# Initialize a standard supabase client, but with the SERVICE_ROLE_KEY to bypass RLS and Auth requirements
# We use the Service Role Key so we can use the admin API to auto-confirm the user
supabase_admin: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

async def seed_database():
    print("Seeding database...")
    
    # 1. Create a user in Supabase Auth
    email = "admin@school.com"
    password = "AdminPassword123!"
    
    print(f"Creating user {email} in Supabase Auth...")
    try:
        # We use the admin API to create the user directly so they are auto-confirmed
        user_response = supabase_admin.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True
        })
        user_id = user_response.user.id
        print(f"User created securely with Auth ID: {user_id}")
    except Exception as e:
        print(f"User might already exist. Attempting to fetch...")
        # If it fails, let's just try to login and get the ID (or we can't fetch easily via admin without listing)
        # Let's list users
        users = supabase_admin.auth.admin.list_users()
        user_id = next((u.id for u in users if u.email == email), None)
        if not user_id:
            print(f"Failed to create or find user: {e}")
            return
        print(f"Found existing User ID: {user_id}")

    # Now we insert into our actual PostgreSQL tables using the supabase_admin client 
    # (since we are using Supabase, we can just use the PostgREST API seamlessly for rapid seeding)

    # 2. Check if a School exists
    print("Checking for existing schools...")
    schools = supabase_admin.table('schools').select('*').execute()
    
    if len(schools.data) == 0:
        print("Creating default 'Beirut International School'...")
        school_id = str(uuid.uuid4())
        school_data = {
            "id": school_id,
            "name": "Beirut International School",
            "domain": "beirut.edu.lb",
            "subscription_plan": "premium",
            "status": "active"
        }
        school_res = supabase_admin.table('schools').insert(school_data).execute()
        school_id = school_res.data[0]['id']
        print(f"School created with ID: {school_id}")
    else:
        school_id = schools.data[0]['id']
        print(f"Using existing School ID: {school_id}")

    # 3. Insert the User record
    print("Registering the User in the 'users' table...")
    try:
        user_record = {
            "id": user_id,
            "school_id": school_id,
            "email": email,
            "full_name": "Omar Mokhtar (Super Admin)",
            "role": "SuperAdmin"
        }
        supabase_admin.table('users').insert(user_record).execute()
        print("User profile linked to school successfully!")
    except Exception as e:
        print(f"Note on user profile: {e}")

    print("\n-----------------------------")
    print("SEEDING COMPLETE!")
    print("-----------------------------")
    print(f"Login URL: http://localhost:3000/login")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print("-----------------------------\n")

if __name__ == "__main__":
    asyncio.run(seed_database())
