import React, { useEffect } from 'react';
import { useGigsStore } from '../../store/gigsStore';
import { useAuthStore } from '../../store/authStore';

const OnHoldProjects: React.FC = () => {
  const { gigs, fetchGigs, activateGig, loading } = useGigsStore();
  const { professorId } = useAuthStore();

  useEffect(() => {
    if (professorId) {
      fetchGigs(professorId);
    }
  }, [professorId, fetchGigs]);

  const onHoldGigs = gigs.filter((g) => g.status === 'on-hold');

  const handleActivate = async (gigId: number) => {
    if (confirm('Are you sure you want to activate this gig?')) {
      await activateGig(gigId);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">On Hold Projects</h1>
        <p className="mt-2 text-sm text-gray-600">
          Projects that are temporarily paused
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : onHoldGigs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No projects on hold</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {onHoldGigs.map((gig) => (
            <div key={gig.id} className="bg-white shadow rounded-lg p-6">
              <div className="border-l-4 border-yellow-500 pl-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900">{gig.title}</h2>
                    <p className="mt-2 text-gray-600">{gig.description}</p>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Area:</span>{' '}
                        <span className="text-gray-600">{gig.area_of_study}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>{' '}
                        <span className="text-gray-600">{gig.paper_type || 'N/A'}</span>
                      </div>
                    </div>

                    {gig.paused_reason && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                        <h3 className="font-medium text-yellow-900">Reason for Hold</h3>
                        <p className="text-sm text-yellow-800 mt-1">{gig.paused_reason}</p>
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    <button
                      onClick={() => handleActivate(gig.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Activate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OnHoldProjects;
