import React from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Button,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useAppSelector } from '../redux/hooks';

const Dashboard: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  
  // Normally these would come from the Redux store
  const upcomingLessons = [
    { id: '1', title: 'Piano Lesson with John', date: '2025-06-21T14:00:00Z' },
    { id: '2', title: 'Violin Lesson with Sarah', date: '2025-06-22T15:30:00Z' },
    { id: '3', title: 'Guitar Group Class', date: '2025-06-23T18:00:00Z' },
  ];
  
  const recentMaterials = [
    { id: '1', title: 'Scales Practice Sheet', date: '2025-06-18T10:00:00Z' },
    { id: '2', title: 'Beginner Piano Book 1', date: '2025-06-16T14:30:00Z' },
  ];
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user?.name || 'User'}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Here's what's happening with your music education today.
            </Typography>
          </Paper>
        </Grid>
        
        {/* Stats Section */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
            }}
          >
            <Box display="flex" alignItems="center" mb={1}>
              <CalendarMonthIcon color="primary" sx={{ mr: 1 }} />
              <Typography component="h2" variant="h6" color="primary">
                Upcoming Lessons
              </Typography>
            </Box>
            <Typography component="p" variant="h3">
              {upcomingLessons.length}
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              Next: Tomorrow at 2:00 PM
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
            }}
          >
            <Box display="flex" alignItems="center" mb={1}>
              <PeopleIcon color="primary" sx={{ mr: 1 }} />
              <Typography component="h2" variant="h6" color="primary">
                Students
              </Typography>
            </Box>
            <Typography component="p" variant="h3">
              12
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              3 new this month
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
            }}
          >
            <Box display="flex" alignItems="center" mb={1}>
              <MusicNoteIcon color="primary" sx={{ mr: 1 }} />
              <Typography component="h2" variant="h6" color="primary">
                Materials
              </Typography>
            </Box>
            <Typography component="p" variant="h3">
              24
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              2 added recently
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
            }}
          >
            <Box display="flex" alignItems="center" mb={1}>
              <AssignmentIcon color="primary" sx={{ mr: 1 }} />
              <Typography component="h2" variant="h6" color="primary">
                Completed Lessons
              </Typography>
            </Box>
            <Typography component="p" variant="h3">
              57
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              Since January 2025
            </Typography>
          </Paper>
        </Grid>
        
        {/* Upcoming Lessons */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardHeader 
              title="Upcoming Lessons" 
              action={
                <Button size="small" color="primary">
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <List>
                {upcomingLessons.map((lesson, index) => (
                  <React.Fragment key={lesson.id}>
                    <ListItem>
                      <ListItemText
                        primary={lesson.title}
                        secondary={
                          new Date(lesson.date).toLocaleString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                          })
                        }
                      />
                    </ListItem>
                    {index < upcomingLessons.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Materials */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardHeader 
              title="Recent Practice Materials" 
              action={
                <Button size="small" color="primary">
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <List>
                {recentMaterials.map((material, index) => (
                  <React.Fragment key={material.id}>
                    <ListItem>
                      <ListItemText
                        primary={material.title}
                        secondary={
                          `Added: ${new Date(material.date).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}`
                        }
                      />
                    </ListItem>
                    {index < recentMaterials.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
