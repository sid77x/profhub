# Admin Audit Logging - Quick Reference

## What's New?

All admin actions are now automatically tracked and logged for **safety and compliance**. This includes:
- Who performed the action (admin name, email, ID)
- What action was performed (onboard, deboard, delete, view)
- What resource was affected (professor, student, gig, application)
- When it happened (UTC timestamp)
- Where it came from (client IP address)
- Whether it succeeded or failed

## How to Access Audit Logs

### Via API Endpoints

**View Recent Audit Logs**
```
GET /api/admin/audit-logs
```

**Filter by Action Type**
```
GET /api/admin/audit-logs?action=deboard_professor&limit=50
```

**Filter by Resource Type**
```
GET /api/admin/audit-logs?resource_type=student&limit=50
```

**Get Audit Statistics**
```
GET /api/admin/audit-stats
```
Returns:
- Total actions (lifetime)
- Actions today
- Actions this week
- Breakdown by admin

**Export Audit Logs**
```
POST /api/admin/audit-logs/export?days=30
```
Returns CSV file with last 30 days of logs

### Via Frontend (Coming Soon)

Once frontend integration is complete, you'll have:
- **Audit Logs Tab** in the admin dashboard
- View all logged actions with filtering
- Search by admin, action, date range
- Export to CSV with one click

## What Gets Logged

### Actions Tracked

**Onboarding (CREATE)**
- Onboard Professor
- Onboard Student

**Deboarding (DELETE)**
- Deboard Professor
- Deboard Student

**Deletions (DELETE)**
- Delete Gig
- Delete Application

**Views (READ)**
- View Professors List
- View Students List
- View Gigs List
- View Applications List
- View Dashboard Stats
- View Audit Logs
- View Audit Statistics

**Admin Only**
- Export Audit Logs

### Information Captured

For each logged action:
- ✅ Admin ID & Name & Email
- ✅ Action Type
- ✅ Resource Type (professor/student/gig/application)
- ✅ Resource ID & Name
- ✅ Timestamp (UTC)
- ✅ Status (success/failed)
- ✅ Error Message (if failed)
- ✅ Client IP Address
- ✅ Additional Details (e.g., gigs_deleted, applications_deleted)

## Security Features

### Token Verification
All endpoints now require valid admin JWT token with `role: "admin"`
- Non-admins get 403 Forbidden error
- Invalid tokens get 401 Unauthorized error

### Immutable Records
Audit logs are append-only - they cannot be edited or deleted
This ensures complete audit trail integrity

### IP Tracking
Client IP address is recorded for each action
Helps identify if admin account is being accessed from unexpected locations

### Error Logging
Failed operations are logged with error messages
Example: "Email already registered" when onboarding fails

## Example Usage Scenarios

### Scenario 1: Find Who Deboarded a Student
```bash
curl -X GET "http://localhost:8000/api/admin/audit-logs?action=deboard_student" \
  -H "Authorization: Bearer {your_admin_token}"
```

### Scenario 2: Audit Trail for Today
```bash
curl -X GET "http://localhost:8000/api/admin/audit-logs?limit=100" \
  -H "Authorization: Bearer {your_admin_token}"
```
Check the timestamps for today's date

### Scenario 3: Export Last Week's Logs
```bash
curl -X POST "http://localhost:8000/api/admin/audit-logs/export?days=7" \
  -H "Authorization: Bearer {your_admin_token}"
```

### Scenario 4: Get Audit Statistics
```bash
curl -X GET "http://localhost:8000/api/admin/audit-stats" \
  -H "Authorization: Bearer {your_admin_token}"
```
Shows who performed what actions and how many

## Compliance & Safety

✅ **Safety**: Complete record of who did what, when, and where
✅ **Accountability**: Every action is attributed to specific admin
✅ **Traceability**: Timestamps allow temporal investigation
✅ **Immutability**: Logs cannot be altered after creation
✅ **Transparency**: Admins can review each other's actions
✅ **Non-Repudiation**: Admins cannot deny performing actions

## Important Notes

1. **Token Required**: All audit endpoints require valid admin token
2. **UTC Timestamps**: All times are in UTC format
3. **IP Tracking**: Helps identify unauthorized access
4. **Read Logs**: Even viewing logs is logged! (for transparency)
5. **Export Format**: CSV files can be imported to Excel, Google Sheets, etc.
6. **No Deletion**: Historical logs are permanent for audit trail integrity

## Troubleshooting

**Q: I'm getting 403 Forbidden when accessing audit logs**
A: Your token might not have admin role. Check login and token contents.

**Q: Timestamps look wrong**
A: All times are stored in UTC. Convert to your local timezone.

**Q: I want to find actions by a specific admin**
A: Use filter: `?admin_id=<admin_id>` or export and filter by admin_email

**Q: Can I delete or edit audit logs?**
A: No, logs are immutable for security and compliance reasons.

## Support

For issues or questions:
1. Check the detailed documentation: `AUDIT_LOGGING_IMPLEMENTATION.md`
2. Verify your admin token is still valid
3. Check server logs for backend errors
