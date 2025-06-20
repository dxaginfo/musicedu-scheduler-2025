import React, { useState } from 'react';
import {
  Box,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Grid,
  Paper,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormHelperText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { selectDate, addLesson, selectLesson } from '../redux/slices/calendarSlice';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
  borderColor?: string;
}

const Calendar: React.FC = () => {
  const dispatch = useAppDispatch();
  const lessons = useAppSelector((state) => state.calendar.lessons);
  const selectedLesson = useAppSelector((state) => state.calendar.selectedLesson);
  
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  
  // Convert lessons to calendar events
  const events: CalendarEvent[] = lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    start: lesson.start,
    end: lesson.end,
    backgroundColor: lesson.status === 'cancelled' ? '#f44336' : '#2196f3',
    borderColor: lesson.status === 'cancelled' ? '#d32f2f' : '#1976d2',
  }));
  
  // For demonstration, add some sample events if none exist
  if (events.length === 0) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    events.push(
      {
        id: '1',
        title: 'Piano Lesson - John Smith',
        start: new Date(today.setHours(10, 0, 0, 0)).toISOString(),
        end: new Date(today.setHours(11, 0, 0, 0)).toISOString(),
      },
      {
        id: '2',
        title: 'Guitar Group Class',
        start: new Date(tomorrow.setHours(15, 0, 0, 0)).toISOString(),
        end: new Date(tomorrow.setHours(16, 30, 0, 0)).toISOString(),
      }
    );
  }
  
  const handleDateClick = (arg: any) => {
    dispatch(selectDate(arg.dateStr));
    setOpenAddDialog(true);
  };
  
  const handleEventClick = (arg: any) => {
    const lesson = lessons.find((l) => l.id === arg.event.id);
    if (lesson) {
      dispatch(selectLesson(lesson));
      setOpenViewDialog(true);
    }
  };
  
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    formik.resetForm();
  };
  
  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
  };
  
  const formik = useFormik({
    initialValues: {
      title: '',
      lessonType: '',
      student: '',
      startTime: new Date(),
      endTime: new Date(new Date().setHours(new Date().getHours() + 1)),
      locationType: 'in-person',
      locationDetails: '',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
      lessonType: Yup.string().required('Lesson type is required'),
      student: Yup.string().required('Student is required'),
      startTime: Yup.date().required('Start time is required'),
      endTime: Yup.date()
        .required('End time is required')
        .min(
          Yup.ref('startTime'),
          'End time must be later than start time'
        ),
      locationType: Yup.string().required('Location type is required'),
      locationDetails: Yup.string().when('locationType', {
        is: (val: string) => val === 'in-person' || val === 'virtual',
        then: (schema) => schema.required('Location details are required'),
        otherwise: (schema) => schema,
      }),
    }),
    onSubmit: (values) => {
      // Generate a new lesson object
      const newLesson = {
        id: Math.random().toString(36).substr(2, 9),
        title: values.title,
        start: values.startTime.toISOString(),
        end: values.endTime.toISOString(),
        teacherId: '1', // In a real app, this would be the current user's ID if they're a teacher
        studentIds: [values.student],
        lessonTypeId: values.lessonType,
        status: 'scheduled' as const,
        locationType: values.locationType as 'in-person' | 'virtual',
        locationDetails: values.locationDetails,
      };
      
      dispatch(addLesson(newLesson));
      handleCloseAddDialog();
    },
  });
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
              <Box sx={{ p: 2, pb: 0 }}>
                <Typography variant="h5" gutterBottom>
                  Lesson Calendar
                </Typography>
              </Box>
              <Box sx={{ height: 650, p: 2 }}>
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                  }}
                  initialView="timeGridWeek"
                  events={events}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={true}
                  dateClick={handleDateClick}
                  eventClick={handleEventClick}
                  height="100%"
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
        
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
          }}
          onClick={() => setOpenAddDialog(true)}
        >
          <AddIcon />
        </Fab>
        
        {/* Add Lesson Dialog */}
        <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Lesson</DialogTitle>
          <DialogContent>
            <Box component="form" noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                fullWidth
                id="title"
                label="Lesson Title"
                name="title"
                autoFocus
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    margin="normal"
                    error={formik.touched.lessonType && Boolean(formik.errors.lessonType)}
                  >
                    <InputLabel>Lesson Type</InputLabel>
                    <Select
                      name="lessonType"
                      value={formik.values.lessonType}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Lesson Type"
                    >
                      <MenuItem value="">Select a type</MenuItem>
                      <MenuItem value="individual">Individual</MenuItem>
                      <MenuItem value="group">Group</MenuItem>
                      <MenuItem value="ensemble">Ensemble</MenuItem>
                    </Select>
                    {formik.touched.lessonType && formik.errors.lessonType && (
                      <FormHelperText>{formik.errors.lessonType}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    margin="normal"
                    error={formik.touched.student && Boolean(formik.errors.student)}
                  >
                    <InputLabel>Student</InputLabel>
                    <Select
                      name="student"
                      value={formik.values.student}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Student"
                    >
                      <MenuItem value="">Select a student</MenuItem>
                      <MenuItem value="student1">John Smith</MenuItem>
                      <MenuItem value="student2">Jane Doe</MenuItem>
                      <MenuItem value="student3">Michael Johnson</MenuItem>
                    </Select>
                    {formik.touched.student && formik.errors.student && (
                      <FormHelperText>{formik.errors.student}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="Start Time"
                    value={formik.values.startTime}
                    onChange={(newValue) => {
                      formik.setFieldValue('startTime', newValue);
                    }}
                    sx={{ mt: 2, width: '100%' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="End Time"
                    value={formik.values.endTime}
                    onChange={(newValue) => {
                      formik.setFieldValue('endTime', newValue);
                    }}
                    sx={{ mt: 2, width: '100%' }}
                  />
                </Grid>
              </Grid>
              
              <FormControl
                fullWidth
                margin="normal"
                error={formik.touched.locationType && Boolean(formik.errors.locationType)}
              >
                <InputLabel>Location Type</InputLabel>
                <Select
                  name="locationType"
                  value={formik.values.locationType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Location Type"
                >
                  <MenuItem value="in-person">In-Person</MenuItem>
                  <MenuItem value="virtual">Virtual</MenuItem>
                </Select>
                {formik.touched.locationType && formik.errors.locationType && (
                  <FormHelperText>{formik.errors.locationType}</FormHelperText>
                )}
              </FormControl>
              
              <TextField
                margin="normal"
                fullWidth
                id="locationDetails"
                label={formik.values.locationType === 'virtual' ? 'Meeting Link' : 'Address'}
                name="locationDetails"
                value={formik.values.locationDetails}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.locationDetails && Boolean(formik.errors.locationDetails)}
                helperText={formik.touched.locationDetails && formik.errors.locationDetails}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddDialog}>Cancel</Button>
            <Button onClick={() => formik.handleSubmit()} variant="contained">
              Add Lesson
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* View Lesson Dialog */}
        {selectedLesson && (
          <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="sm" fullWidth>
            <DialogTitle>{selectedLesson.title}</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Time:</strong> {new Date(selectedLesson.start).toLocaleString()} - {new Date(selectedLesson.end).toLocaleTimeString()}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Status:</strong> {selectedLesson.status.charAt(0).toUpperCase() + selectedLesson.status.slice(1)}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Location:</strong> {selectedLesson.locationType === 'virtual' ? 'Virtual Meeting' : 'In-Person'} 
                  {selectedLesson.locationDetails && ` (${selectedLesson.locationDetails})`}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseViewDialog}>Close</Button>
              <Button variant="contained" color="primary">
                Edit
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Container>
    </LocalizationProvider>
  );
};

export default Calendar;
