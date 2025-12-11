import React, { useEffect } from 'react';
import { useGigsStore } from '../../store/gigsStore';
import { useAuthStore } from '../../store/authStore';

const ClosedProjects: React.FC = () => {
  const { gigs, fetchGigs, loading } = useGigsStore();
  const { professorId } = useAuthStore();

  useEffect(() => {
    if (professorId) {
      fetchGigs(professorId);
    }
  }, [professorId, fetchGigs]);

  const closedGigs = gigs.filter((g) => g.status === 'closed');

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Closed Projects</h1>
        <p className="mt-2 text-sm text-gray-600">
          Projects that have been completed and published
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : closedGigs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No closed projects yet</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {closedGigs.map((gig) => (
            <div key={gig.id} className="bg-white shadow rounded-lg p-6">
              <div className="border-l-4 border-green-500 pl-4">
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

                {gig.publication_venue && (
                  <div className="mt-4 p-3 bg-green-50 rounded-md">
                    <h3 className="font-medium text-green-900">Publication Details</h3>
                    <p className="text-sm text-green-800 mt-1">
                      <span className="font-medium">Venue:</span> {gig.publication_venue}
                    </p>
                    {gig.publication_link && (
                      <p className="text-sm text-green-800 mt-1">
                        <span className="font-medium">Link:</span>{' '}
                        <a
                          href={gig.publication_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {gig.publication_link}
                        </a>
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <h3 className="font-medium text-gray-900">Student Contributors</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    (Student list coming soon)
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClosedProjects;
